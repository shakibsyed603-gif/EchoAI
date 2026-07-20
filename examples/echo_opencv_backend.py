import cv2
import numpy as np
import base64

class EchoAIPipeline:
    def __init__(self):
        # In a real app, this is where you load the PyTorch U-Net 
        # self.unet_model = torch.load("unet_echo.pt")
        print("🧠 AI Pipeline Initialized")

    def process_study(self, image_bytes: bytes):
        """
        The main pipeline triggered by FastAPI when React uploads an image.
        """
        # ---------------------------------------------------------
        # STEP 1: PRE-PROCESSING (OpenCV)
        # ---------------------------------------------------------
        # Convert the raw bytes sent from React into a matrix OpenCV can read
        nparr = np.frombuffer(image_bytes, np.uint8)
        original_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # 1. Convert to Grayscale (AI models prefer single color channels)
        gray_img = cv2.cvtColor(original_img, cv2.COLOR_BGR2GRAY)
        
        # 2. Resize to exactly 512x512 (Standard shape for U-Net models)
        resized_img = cv2.resize(gray_img, (512, 512))
        
        # 3. Contrast Limited Adaptive Histogram Equalization (CLAHE)
        # This makes the heart chamber walls pop out against the dark blood!
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced_img = clahe.apply(resized_img)

        # ---------------------------------------------------------
        # STEP 2: AI INFERENCE (PyTorch)
        # ---------------------------------------------------------
        # We pass the 'enhanced_img' into PyTorch here. 
        # For this example, we mock the AI returning a binary mask 
        # (where 255 = Left Ventricle, 0 = Background)
        lv_mask = self._mock_pytorch_unet(enhanced_img)

        # ---------------------------------------------------------
        # STEP 3: CLINICAL METRICS (OpenCV Math)
        # ---------------------------------------------------------
        # Find the boundary (contour) of the Left Ventricle from the AI mask
        contours, _ = cv2.findContours(lv_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        ejection_fraction, lv_edd_mm = 0, 0
        if contours:
            # Get the largest detected chamber
            lv_contour = max(contours, key=cv2.contourArea)
            
            # 1. Calculate Area (Pixels squared)
            pixel_area = cv2.contourArea(lv_contour)
            
            # 2. Convert to mm² (assuming 1 pixel = 0.26mm in an Echo)
            pixel_to_mm_scale = 0.26 
            actual_area_mm2 = pixel_area * (pixel_to_mm_scale ** 2)
            
            # 3. Calculate dimension (Left Ventricle End-Diastolic Dimension)
            x, y, w, h = cv2.boundingRect(lv_contour)
            lv_edd_mm = w * pixel_to_mm_scale
            
            # 4. Mock Ejection fraction calculation based on chamber volume differences
            ejection_fraction = 62.0 

        # ---------------------------------------------------------
        # STEP 4: VISUAL OVERLAY (OpenCV Drawing)
        # ---------------------------------------------------------
        # Convert our black & white resized image back to color so we can draw blue overlays
        output_img = cv2.cvtColor(enhanced_img, cv2.COLOR_GRAY2BGR)
        
        # Create a blue transparency mask over the Left Ventricle
        blue_overlay = np.zeros_like(output_img)
        cv2.drawContours(blue_overlay, [lv_contour], -1, (255, 140, 0), thickness=cv2.FILLED) # BGR (Light Blue)
        
        # Blend the original image with the blue overlay using OpenCV addWeighted
        cv2.addWeighted(blue_overlay, 0.4, output_img, 1.0, 0, output_img)
        
        # Draw the outline around it
        cv2.drawContours(output_img, [lv_contour], -1, (255, 200, 50), thickness=2)
        
        # Encode back to base64 so FastAPI can send it straight to React's <img src="...">
        _, buffer = cv2.imencode('.png', output_img)
        base64_image = base64.b64encode(buffer).decode('utf-8')

        return {
            "metrics": {
                "ejection_fraction": f"{ejection_fraction}%",
                "lv_edd": f"{lv_edd_mm:.1f} mm",
                "confidence": "97%"
            },
            "segmented_image_base64": f"data:image/png;base64,{base64_image}"
        }

    def _mock_pytorch_unet(self, enhanced_img):
        """Simulates PyTorch returning a 512x512 matrix mask of the Left Ventricle"""
        mask = np.zeros((512, 512), dtype=np.uint8)
        # Draw a fake left ventricle shape for demo purposes
        cv2.ellipse(mask, (256, 256), (90, 140), angle=30, startAngle=0, endAngle=360, color=255, thickness=-1)
        return mask

# ====== HOW FASTAPI USES THIS ======
# @app.post("/api/analyze")
# async def analyze_echo(file: UploadFile):
#     bytes_data = await file.read()
#     pipeline = EchoAIPipeline()
#     results = pipeline.process_study(bytes_data)
#     
#     return results
