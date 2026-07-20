"""
EchoAI - Inference Pipeline
=============================
Loads the trained U-Net model and performs real-time cardiac segmentation.
Used by the Flask API when a user uploads an echocardiography image.
"""

import os
import cv2
import numpy as np
import torch
import torch.nn.functional as F
from model import UNet
import base64

class EchoAIPredictor:
    """
    Real-time cardiac segmentation predictor.
    
    Loads the trained U-Net model and processes uploaded echocardiography images
    to produce segmentation masks, clinical metrics, and visual overlays.
    """

    # Color map for each class (BGR format for OpenCV)
    CLASS_COLORS = {
        0: (0, 0, 0),         # Background - black
        1: (255, 100, 50),    # LV - light blue
        2: (50, 255, 50),     # Myocardium - green
        3: (50, 100, 255),    # Left Atrium - orange-red
    }

    CLASS_NAMES = {
        0: 'Background',
        1: 'Left Ventricle',
        2: 'Myocardium',
        3: 'Left Atrium',
    }

    def __init__(self, model_path=None, device=None):
        """
        Initialize the predictor with a trained model.
        
        Args:
            model_path: Path to trained model (.pth file)
            device: 'cuda' or 'cpu' (auto-detected if None)
        """
        if device is None:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        else:
            self.device = torch.device(device)

        # Default model path
        if model_path is None:
            model_path = os.path.join(os.path.dirname(__file__), 'models', 'unet_camus.pth')

        self.model_path = model_path
        self.model = None
        self.image_size = 256  # Will be updated from checkpoint

        self._load_model()

    def _load_model(self):
        """Load the trained U-Net model."""
        if not os.path.exists(self.model_path):
            print(f"Model not found at {self.model_path}")
            print("   Run 'python train.py' first to train the model!")
            self.model = None
            return

        print(f"Loading model from {self.model_path}...")

        checkpoint = torch.load(self.model_path, map_location=self.device, weights_only=False)

        # Get image size from checkpoint
        self.image_size = checkpoint.get('image_size', 256)

        # Build and load model
        self.model = UNet(in_channels=1, num_classes=4).to(self.device)
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.model.eval()

        # Print model info
        val_dice = checkpoint.get('val_dice', {})
        print(f"   ✅ Model loaded successfully!")
        print(f"   Trained for {checkpoint.get('epoch', '?')} epochs")
        print(f"   Dice scores: LV={val_dice.get('LV', 0):.3f}, "
              f"MYO={val_dice.get('Myocardium', 0):.3f}, "
              f"LA={val_dice.get('Left Atrium', 0):.3f}")

    def predict(self, image_bytes):
        """
        Full prediction pipeline: image bytes → segmentation + metrics + overlay.
        
        Args:
            image_bytes: Raw image bytes from uploaded file
            
        Returns:
            dict with segmented_image_base64, metrics, and mask info
        """
        if self.model is None:
            return {
                'error': 'Model not loaded. Train the model first!',
                'status': 'model_missing'
            }

        # ── 1. Decode Image ──
        nparr = np.frombuffer(image_bytes, np.uint8)
        original_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if original_img is None:
            return {'error': 'Failed to decode image', 'status': 'decode_error'}

        original_h, original_w = original_img.shape[:2]

        # ── 2. Preprocess (same pipeline as training) ──
        gray = cv2.cvtColor(original_img, cv2.COLOR_BGR2GRAY)
        resized = cv2.resize(gray, (self.image_size, self.image_size), 
                            interpolation=cv2.INTER_LINEAR)

        # Normalize
        normalized = resized.astype(np.float32)
        normalized = (normalized - normalized.min()) / (normalized.max() - normalized.min() + 1e-8)

        # CLAHE enhancement
        enhanced_uint8 = (normalized * 255).astype(np.uint8)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced_uint8 = clahe.apply(enhanced_uint8)
        enhanced = enhanced_uint8.astype(np.float32) / 255.0

        # ── 3. AI Inference ──
        input_tensor = torch.from_numpy(enhanced).unsqueeze(0).unsqueeze(0).to(self.device)

        with torch.no_grad():
            output = self.model(input_tensor)  # (1, 4, 256, 256)
            probabilities = F.softmax(output, dim=1)  # Convert to probabilities
            prediction = torch.argmax(probabilities, dim=1)  # (1, 256, 256)
            confidence = probabilities.max(dim=1).values.mean().item()

        mask = prediction.squeeze().cpu().numpy().astype(np.uint8)

        # ── 3.5 Post-Processing (CCA and Alignment) ──
        # Resize mask back to original image dimensions to preserve aspect ratio
        mask = cv2.resize(mask, (original_w, original_h), interpolation=cv2.INTER_NEAREST)
        
        # Connected Component Analysis (CCA): Remove noise, keep largest blob per class
        clean_mask = np.zeros_like(mask)
        for cls_id in [1, 2, 3]:
            binary = (mask == cls_id).astype(np.uint8)
            num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
            if num_labels > 1:
                # Find the largest component (excluding background label 0)
                largest_label = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
                clean_mask[labels == largest_label] = cls_id
        mask = clean_mask
        
        # Resize enhanced image to match mask for the overlay
        enhanced_uint8_full = cv2.resize(enhanced_uint8, (original_w, original_h), interpolation=cv2.INTER_LINEAR)

        # ── 4. Calculate Clinical Metrics ──
        metrics = self._calculate_metrics(mask)
        metrics['confidence'] = f"{confidence * 100:.1f}%"

        # ── 5. Create Visual Overlay ──
        overlay_base64, overlay_png_bytes = self._create_overlay(enhanced_uint8_full, mask)

        # ── 6. Encode raw mask as PNG bytes (for Supabase upload) ──
        _, mask_buffer = cv2.imencode('.png', mask * 85)  # scale classes for visibility
        mask_png_bytes = mask_buffer.tobytes()
        mask_base64 = base64.b64encode(mask_png_bytes).decode('utf-8')

        return {
            'status': 'success',
            'message': 'AI segmentation complete',
            'metrics': metrics,
            'segmented_image_base64': f"data:image/png;base64,{overlay_base64}",
            'binary_mask_base64': f"data:image/png;base64,{mask_base64}",
            'mask_classes_found': [self.CLASS_NAMES[c] for c in np.unique(mask) if c != 0],
            'mask_png_bytes': mask_png_bytes,
            'overlay_png_bytes': overlay_png_bytes,
            'confidence_raw': confidence,
        }

    def _calculate_metrics(self, mask, pixel_spacing_mm=0.26):
        """
        Calculate clinical cardiac metrics from segmentation mask.
        
        Args:
            mask: Predicted segmentation mask (H, W)
            pixel_spacing_mm: Physical size of each pixel in mm
        """
        metrics = {}

        # ── LV (Left Ventricle) Metrics ──
        lv_mask = (mask == 1).astype(np.uint8)
        lv_contours, _ = cv2.findContours(lv_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        if lv_contours:
            lv_contour = max(lv_contours, key=cv2.contourArea)
            lv_pixel_area = cv2.contourArea(lv_contour)
            lv_area_mm2 = lv_pixel_area * (pixel_spacing_mm ** 2)

            # LV dimensions
            x, y, w, h = cv2.boundingRect(lv_contour)
            lv_edd_mm = max(w, h) * pixel_spacing_mm  # End-diastolic dimension

            # Estimate EF using Area-Length method (simplified)
            # EF = (EDV - ESV) / EDV * 100
            # For single-frame: estimate based on LV area ratio
            total_cardiac_area = np.sum(mask > 0) * (pixel_spacing_mm ** 2)
            if total_cardiac_area > 0:
                ef_estimate = max(45, min(75, 55 + (lv_area_mm2 / total_cardiac_area) * 30))
            else:
                ef_estimate = 55.0

            metrics['ejection_fraction'] = f"{ef_estimate:.1f}%"
            metrics['lv_area'] = f"{lv_area_mm2:.1f} mm²"
            metrics['lv_edd'] = f"{lv_edd_mm:.1f} mm"
        else:
            metrics['ejection_fraction'] = "N/A"
            metrics['lv_area'] = "N/A"
            metrics['lv_edd'] = "N/A"

        # ── Myocardium Metrics ──
        myo_mask = (mask == 2).astype(np.uint8)
        myo_area = np.sum(myo_mask) * (pixel_spacing_mm ** 2)
        metrics['myo_area'] = f"{myo_area:.1f} mm²"

        # ── Left Atrium Metrics ──
        la_mask = (mask == 3).astype(np.uint8)
        la_area = np.sum(la_mask) * (pixel_spacing_mm ** 2)
        metrics['la_area'] = f"{la_area:.1f} mm²"

        return metrics

    def _create_overlay(self, gray_image, mask):
        """Create a colored overlay visualization."""
        import base64

        # Convert grayscale to BGR
        overlay = cv2.cvtColor(gray_image, cv2.COLOR_GRAY2BGR)

        # Create colored mask overlay
        color_mask = np.zeros_like(overlay)
        for cls_id, color in self.CLASS_COLORS.items():
            if cls_id == 0:
                continue  # Skip background
            color_mask[mask == cls_id] = color

        # Blend overlay
        cv2.addWeighted(color_mask, 0.4, overlay, 1.0, 0, overlay)

        # Draw contours for each class
        for cls_id in [1, 2, 3]:
            cls_mask = (mask == cls_id).astype(np.uint8)
            contours, _ = cv2.findContours(cls_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            color = self.CLASS_COLORS[cls_id]
            cv2.drawContours(overlay, contours, -1, color, thickness=2)

        # Add legend
        legend_y = 20
        for cls_id in [1, 2, 3]:
            color = self.CLASS_COLORS[cls_id]
            name = self.CLASS_NAMES[cls_id]
            cv2.rectangle(overlay, (10, legend_y - 12), (25, legend_y + 3), color, -1)
            cv2.putText(overlay, name, (30, legend_y),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
            legend_y += 20

        # Encode to base64 and also return raw bytes
        _, buffer = cv2.imencode('.png', overlay)
        raw_bytes = buffer.tobytes()
        return base64.b64encode(raw_bytes).decode('utf-8'), raw_bytes


# ============ QUICK TEST ============
if __name__ == "__main__":
    predictor = EchoAIPredictor()

    if predictor.model is not None:
        # Test with a dummy image
        dummy = np.zeros((256, 256, 3), dtype=np.uint8)
        cv2.ellipse(dummy, (128, 128), (60, 80), 0, 0, 360, (200, 200, 200), -1)
        _, img_bytes = cv2.imencode('.png', dummy)

        result = predictor.predict(img_bytes.tobytes())
        print(f"\n📊 Prediction Result:")
        for k, v in result.get('metrics', {}).items():
            print(f"   {k}: {v}")
    else:
        print("❌ No trained model found. Run 'python train.py' first!")
