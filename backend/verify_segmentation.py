import os
import sys
import numpy as np
import cv2
import nibabel as nib
import torch
import torch.nn.functional as F
import matplotlib.pyplot as plt

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
from predict import EchoAIPredictor
from dataset import CAMUSDataset

def calculate_metrics(pred_mask, gt_mask, num_classes=4):
    dice_scores = {}
    iou_scores = {}
    for c in range(1, num_classes):
        pred_c = (pred_mask == c)
        gt_c = (gt_mask == c)
        
        intersection = np.sum(pred_c & gt_c)
        union = np.sum(pred_c | gt_c)
        
        dice = (2. * intersection) / (np.sum(pred_c) + np.sum(gt_c) + 1e-8)
        iou = intersection / (union + 1e-8)
        
        dice_scores[c] = dice
        iou_scores[c] = iou
        
    return dice_scores, iou_scores

def plot_images(original, gt_mask, raw_mask, clean_mask, overlay, save_path):
    fig, axes = plt.subplots(1, 5, figsize=(25, 5))
    axes[0].imshow(original, cmap='gray')
    axes[0].set_title('Original Image')
    axes[0].axis('off')
    
    axes[1].imshow(gt_mask, cmap='nipy_spectral')
    axes[1].set_title('Ground Truth')
    axes[1].axis('off')
    
    axes[2].imshow(raw_mask, cmap='nipy_spectral')
    axes[2].set_title('Raw U-Net Prediction')
    axes[2].axis('off')
    
    axes[3].imshow(clean_mask, cmap='nipy_spectral')
    axes[3].set_title('Post-processed Prediction')
    axes[3].axis('off')
    
    # Overlay is BGR, convert to RGB for matplotlib
    axes[4].imshow(cv2.cvtColor(overlay, cv2.COLOR_BGR2RGB))
    axes[4].set_title('Final Overlay')
    axes[4].axis('off')
    
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()

def main():
    data_dir = r"c:\Users\Syed Shakib ali\Downloads\EchoAI001\data\camus\database_nifti"
    patient = "patient0001"
    view = "4CH"
    phase = "ED"
    
    img_path = os.path.join(data_dir, patient, f"{patient}_{view}_{phase}.nii.gz")
    gt_path = os.path.join(data_dir, patient, f"{patient}_{view}_{phase}_gt.nii.gz")
    
    print(f"Loading {img_path}")
    
    # Load NIfTI
    img_nii = nib.load(img_path)
    image = img_nii.get_fdata().astype(np.float32)
    gt_nii = nib.load(gt_path)
    gt_mask = gt_nii.get_fdata().astype(np.uint8)
    
    if image.ndim == 3: image = image[:, :, 0]
    if gt_mask.ndim == 3: gt_mask = gt_mask[:, :, 0]
        
    original_h, original_w = image.shape[:2]
    print(f"Original shape: {original_w}x{original_h}")
    
    # Encode as PNG to test predictor
    img_norm = (image - image.min()) / (image.max() - image.min() + 1e-8)
    img_uint8 = (img_norm * 255).astype(np.uint8)
    _, img_png_buffer = cv2.imencode('.png', img_uint8)
    img_bytes = img_png_buffer.tobytes()
    
    # Initialize Predictor
    predictor = EchoAIPredictor()
    
    if predictor.model is None:
        print("Model not loaded!")
        return
        
    # --- Run Inference step-by-step to get Raw vs Post-processed ---
    # Preprocess
    resized = cv2.resize(img_uint8, (256, 256), interpolation=cv2.INTER_LINEAR)
    normalized = resized.astype(np.float32) / 255.0
    
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced_uint8 = clahe.apply((normalized * 255).astype(np.uint8))
    enhanced = enhanced_uint8.astype(np.float32) / 255.0
    
    input_tensor = torch.from_numpy(enhanced).unsqueeze(0).unsqueeze(0).to(predictor.device)
    
    with torch.no_grad():
        output = predictor.model(input_tensor)
        probabilities = F.softmax(output, dim=1)
        prediction = torch.argmax(probabilities, dim=1)
        
    raw_mask_256 = prediction.squeeze().cpu().numpy().astype(np.uint8)
    raw_mask = cv2.resize(raw_mask_256, (original_w, original_h), interpolation=cv2.INTER_NEAREST)
    
    # CCA Post-processing
    clean_mask = np.zeros_like(raw_mask)
    for cls_id in [1, 2, 3]:
        binary = (raw_mask == cls_id).astype(np.uint8)
        num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
        if num_labels > 1:
            largest_label = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
            clean_mask[labels == largest_label] = cls_id
            
    # Final Overlay
    enhanced_uint8_full = cv2.resize(enhanced_uint8, (original_w, original_h), interpolation=cv2.INTER_LINEAR)
    _, overlay_png_bytes = predictor._create_overlay(enhanced_uint8_full, clean_mask)
    overlay = cv2.imdecode(np.frombuffer(overlay_png_bytes, np.uint8), cv2.IMREAD_COLOR)
    
    # Calculate Metrics
    dice_scores, iou_scores = calculate_metrics(clean_mask, gt_mask)
    
    print("\n--- Clinical Metrics (Post-Processed) ---")
    print(f"LV  - Dice: {dice_scores[1]:.3f}, IoU: {iou_scores[1]:.3f}")
    print(f"MYO - Dice: {dice_scores[2]:.3f}, IoU: {iou_scores[2]:.3f}")
    print(f"LA  - Dice: {dice_scores[3]:.3f}, IoU: {iou_scores[3]:.3f}")
    
    save_path = r"c:\Users\Syed Shakib ali\.gemini\antigravity-ide\brain\d2a280e4-fa69-453b-bb86-4a0dd4f96b38\segmentation_verification.png"
    plot_images(img_uint8, gt_mask, raw_mask, clean_mask, overlay, save_path)
    print(f"\nSaved visualization to {save_path}")

if __name__ == "__main__":
    main()
