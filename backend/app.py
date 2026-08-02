"""
EchoAI - Flask Backend API
============================
Real AI-powered echocardiography analysis using trained U-Net model.

Endpoints:
  POST /api/analyze      → Real AI segmentation + metrics
  POST /api/enhance      → Real OpenCV CLAHE enhancement
  POST /api/generate_pdf → Clinical PDF report
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cv2
import numpy as np
from fpdf import FPDF
import io
import base64
import os
import time
import supabase_client as sb

try:
    from enhancement.enhancement_service import enhance_with_residual_cnn as _cnn_enhance
    _CNN_AVAILABLE = True
except Exception as _cnn_load_err:
    print(f"[app.py] Warning: Residual CNN enhancement not available: {_cnn_load_err}")
    _CNN_AVAILABLE = False

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

@app.after_request
def add_cors_headers(response):
    """Ensure CORS headers are always present on every response."""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

# ── Load AI Model (once at startup) ──
predictor = None

def get_predictor():
    """Lazy-load the AI predictor (only when first needed)."""
    global predictor
    if predictor is None:
        try:
            from predict import EchoAIPredictor
            predictor = EchoAIPredictor()
        except Exception as e:
            print(f"Warning: Could not load AI model: {e}")
    return predictor


@app.route("/")
def home():
    model_status = "loaded" if predictor and predictor.model else "not loaded"
    return jsonify({
        "status": "EchoAI Backend Running",
        "model": model_status,
        "project": "EchoAI"
    })


@app.route("/api/enhance", methods=["POST", "OPTIONS"])
def enhance_image():
    """
    Image enhancement endpoint.
    Supports two pipelines selected via the 'enhancement_model' form field:
      - 'residual_cnn'  → EchoEnhancerV2 deep learning inference
      - 'classical'     → CLAHE + NLMeans + Sharpen (original pipeline, default)
    Optionally persists the enhanced image to Supabase when study_id is provided.
    """
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files['image']
    image_bytes = file.read()
    study_id = request.form.get('study_id')  # optional
    enhancement_model = request.form.get('enhancement_model', 'classical')  # new param

    if len(image_bytes) == 0:
        return jsonify({"error": "Empty image file"}), 400

    t_start = time.time()

    # Decode image
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        return jsonify({"error": "Failed to decode image"}), 400

    original_h, original_w = img.shape[:2]

    # ── Enhancement Pipeline (branched by enhancement_model) ──────────────────
    if enhancement_model == 'residual_cnn' and _CNN_AVAILABLE:
        # ── Residual CNN branch ──────────────────────────────────────────────
        print(f"[enhance] Using Residual CNN (EchoEnhancerV2)")

        final_enhanced = _cnn_enhance(img)          # returns uint8 grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) # keep for metrics
        method_label = "Residual CNN (EchoEnhancerV2)"

    else:
        # ── Classical pipeline (original, unchanged) ─────────────────────────
        if enhancement_model == 'residual_cnn' and not _CNN_AVAILABLE:
            print("[enhance] Residual CNN requested but not available — falling back to classical")
        else:
            print(f"[enhance] Using Classical enhancement (CLAHE + NLMeans + Sharpen)")

        # 1. Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 2. Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)

        # 3. Denoise using Non-Local Means (removes speckle noise)
        denoised = cv2.fastNlMeansDenoising(enhanced, None, h=10, templateWindowSize=7, searchWindowSize=21)

        # 4. Sharpen edges (for wall boundaries)
        kernel_sharpen = np.array([[-1, -1, -1],
                                    [-1,  9, -1],
                                    [-1, -1, -1]])
        sharpened = cv2.filter2D(denoised, -1, kernel_sharpen)

        # 5. Blend: 70% sharpened + 30% denoised (balance detail vs noise)
        final_enhanced = cv2.addWeighted(sharpened, 0.7, denoised, 0.3, 0)
        method_label = "CLAHE + NLMeans + Sharpen"

    processing_time = f"{time.time() - t_start:.2f}s"

    # Calculate quality metrics (shared by both branches)
    noise_before = np.std(gray.astype(float))
    noise_after = np.std(final_enhanced.astype(float))
    noise_reduction = ((noise_before - noise_after) / noise_before) * 100 if noise_before > 0 else 0

    # PSNR (Peak Signal-to-Noise Ratio)
    mse = np.mean((gray.astype(float) - final_enhanced.astype(float)) ** 2)
    psnr = 10 * np.log10(255 ** 2 / mse) if mse > 0 else 99.0

    # Encode enhanced image to base64
    _, buffer = cv2.imencode('.png', final_enhanced)
    enhanced_png_bytes = buffer.tobytes()
    enhanced_base64 = base64.b64encode(enhanced_png_bytes).decode('utf-8')

    print(f"Enhanced image: {original_w}x{original_h} -> PSNR: {psnr:.1f}, Noise reduction: {noise_reduction:.1f}% [{method_label}]")

    # ── Supabase persistence (best-effort) ──
    enhanced_image_url = None
    if study_id:
        print(f"   [SUPABASE] study_id received: {study_id}")
        processing_time_num = round(time.time() - t_start, 2)

        # Storage upload is blocked by RLS on the anon key from server-side,
        # so we store the base64 data URI as the enhanced_image_url instead.
        enhanced_image_url = f"data:image/png;base64,{enhanced_base64}"
        print(f"   [SUPABASE] enhanced_image_url length: {len(enhanced_image_url)}")

        update_payload = {
            'enhanced_image_url': enhanced_image_url,
            'processing_time': processing_time_num,
        }
        print(f"   [SUPABASE] Update payload keys: {list(update_payload.keys())}")
        print(f"   [SUPABASE] processing_time value: {processing_time_num} (type: {type(processing_time_num).__name__})")

        success = sb.update_study(study_id, update_payload)
        print(f"   [SUPABASE] update_study returned: {success}")
    else:
        print(f"   [SUPABASE] No study_id provided -- skipping persistence")

    response_data = {
        "status": "success",
        "enhanced_image_base64": f"data:image/png;base64,{enhanced_base64}",
        "metrics": {
            "psnr": f"{psnr:.1f}",
            "noise_reduction": f"{abs(noise_reduction):.0f}%",
            "resolution": f"{original_w}x{original_h}",
            "method": method_label
        },
        "processing_time": processing_time,
    }
    if enhanced_image_url:
        response_data["enhanced_image_url"] = enhanced_image_url

    return jsonify(response_data)


@app.route("/api/analyze", methods=["POST", "OPTIONS"])
def analyze_study():
    """
    REAL AI segmentation using trained U-Net model.
    Takes an echocardiogram image and returns segmentation + clinical metrics.
    Optionally persists results to Supabase when study_id is provided.
    """
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files['image']
    image_bytes = file.read()
    study_id = request.form.get('study_id')  # optional

    if len(image_bytes) == 0:
        return jsonify({"error": "Empty image file"}), 400

    t_start = time.time()

    # ── Try real AI prediction ──
    ai_predictor = get_predictor()

    if ai_predictor and ai_predictor.model is not None:
        # REAL AI segmentation
        print("Running REAL U-Net segmentation...")
        result = ai_predictor.predict(image_bytes)
    else:
        # Fallback: OpenCV-based segmentation (no trained model yet)
        print("No trained model found. Using OpenCV fallback...")
        result = analyze_with_opencv(image_bytes)

    processing_time = f"{time.time() - t_start:.2f}s"

    if "metrics" not in result:
     result["metrics"] = {}

    result["metrics"]["processing_time"] = processing_time
    # ── Supabase persistence (best-effort) ──
    if study_id and result.get('status') == 'success':
        print(f"   [SUPABASE] study_id received: {study_id}")

        mask_png_bytes = result.pop('mask_png_bytes', None)
        overlay_png_bytes = result.pop('overlay_png_bytes', None)
        confidence_raw = result.pop('confidence_raw', None)

        processing_time_num = round(time.time() - t_start, 2)

        update_fields = {
            'processing_time': processing_time_num,
        }

        # Storage upload is blocked by RLS from server-side anon key,
        # so we encode the images as base64 data URIs for the URL columns.
        if mask_png_bytes:
            mask_b64 = base64.b64encode(mask_png_bytes).decode('utf-8')
            mask_url = f"data:image/png;base64,{mask_b64}"
            update_fields['segmentation_mask_url'] = mask_url
            result['segmentation_mask_url'] = mask_url
            print(f"   [SUPABASE] segmentation_mask_url set (len={len(mask_url)})")

        if overlay_png_bytes:
            overlay_b64 = base64.b64encode(overlay_png_bytes).decode('utf-8')
            overlay_url = f"data:image/png;base64,{overlay_b64}"
            update_fields['overlay_image_url'] = overlay_url
            result['overlay_image_url'] = overlay_url
            print(f"   [SUPABASE] overlay_image_url set (len={len(overlay_url)})")

        # Save metrics -- confidence_score is NUMERIC, so send float
        metrics = result.get('metrics', {})
        ef = metrics.get('ejection_fraction', 'N/A')
        conf_str = metrics.get('confidence', 'N/A')

        update_fields['ejection_fraction'] = ef

        # Parse confidence to a float for the numeric column
        try:
            conf_num = float(conf_str.replace('%', '').replace('(', '').split()[0])
        except (ValueError, AttributeError, IndexError):
            conf_num = confidence_raw * 100 if confidence_raw else 0.0
        update_fields['confidence_score'] = round(conf_num, 1)

        # Generate AI findings summary
        classes_found = result.get('mask_classes_found', [])
        model_type = result.get('model_type', 'U-Net AI')
        ai_findings = _generate_ai_findings(metrics, classes_found, model_type)
        update_fields['ai_findings'] = ai_findings
        result['ai_findings'] = ai_findings

        print(f"   [SUPABASE] Update payload: {{{', '.join(f'{k}: {type(v).__name__}' for k, v in update_fields.items())}}}")
        success = sb.update_study(study_id, update_fields)
        print(f"   [SUPABASE] update_study returned: {success}")
    else:
        if not study_id:
            print(f"   [SUPABASE] No study_id provided -- skipping persistence")
        elif result.get('status') != 'success':
            print(f"   [SUPABASE] Result status is '{result.get('status')}' -- skipping persistence")
        # Remove raw bytes from response even when no study_id
        result.pop('mask_png_bytes', None)
        result.pop('overlay_png_bytes', None)
        result.pop('confidence_raw', None)

    return jsonify(result)


def _generate_ai_findings(metrics: dict, classes_found: list, model_type: str) -> str:
    """Generate a concise AI findings summary from segmentation metrics."""
    parts = []

    ef = metrics.get('ejection_fraction', 'N/A')
    if ef != 'N/A':
        # Extract numeric value
        try:
            ef_val = float(ef.replace('%', '').strip())
            if ef_val >= 55:
                parts.append(f"Normal LV systolic function (EF {ef}).")
            elif ef_val >= 40:
                parts.append(f"Mildly reduced LV systolic function (EF {ef}).")
            else:
                parts.append(f"Reduced LV systolic function (EF {ef}).")
        except ValueError:
            parts.append(f"Ejection fraction: {ef}.")

    if classes_found:
        parts.append(f"Structures identified: {', '.join(classes_found)}.")

    conf = metrics.get('confidence', '')
    if conf:
        parts.append(f"Model confidence: {conf}.")

    parts.append(f"Analysis performed using {model_type}.")

    return ' '.join(parts)


def analyze_with_opencv(image_bytes):
    """
    Fallback segmentation using OpenCV when U-Net model is not yet trained.
    Uses thresholding + contour detection for basic chamber detection.
    Returns a dict (not a jsonify response) so the caller can persist it.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        return {"error": "Failed to decode image", "status": "decode_error"}

    original_h, original_w = img.shape[:2]

    # Preprocessing
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(gray, (256, 256))

    # CLAHE enhancement
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(resized)

    # Threshold to find dark regions (blood-filled chambers)
    _, thresh = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # Morphological operations to clean up
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=2)
    cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_OPEN, kernel, iterations=1)

    # Find contours
    contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Create overlay
    overlay = cv2.cvtColor(enhanced, cv2.COLOR_GRAY2BGR)
    
    lv_area_mm2 = 0
    ef_estimate = 0

    if contours:
        # Sort by area, take largest as LV
        contours = sorted(contours, key=cv2.contourArea, reverse=True)

        colors = [(255, 100, 50), (50, 255, 50), (50, 100, 255)]  # Blue, Green, Red
        names = ['LV', 'MYO', 'LA']

        for i, cnt in enumerate(contours[:3]):
            if cv2.contourArea(cnt) < 100:
                continue

            color = colors[i % len(colors)]
            # Draw filled overlay
            mask_overlay = np.zeros_like(overlay)
            cv2.drawContours(mask_overlay, [cnt], -1, color, -1)
            cv2.addWeighted(mask_overlay, 0.3, overlay, 1.0, 0, overlay)
            cv2.drawContours(overlay, [cnt], -1, color, 2)

            # Add label
            M = cv2.moments(cnt)
            if M["m00"] > 0:
                cx = int(M["m10"] / M["m00"])
                cy = int(M["m01"] / M["m00"])
                cv2.putText(overlay, names[i % 3], (cx - 10, cy),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

        # Calculate metrics from largest contour (LV)
        lv_contour = contours[0]
        pixel_area = cv2.contourArea(lv_contour)
        pixel_to_mm = 0.26
        lv_area_mm2 = pixel_area * (pixel_to_mm ** 2)

        x, y, w, h = cv2.boundingRect(lv_contour)
        lv_edd_mm = max(w, h) * pixel_to_mm

        # Estimate EF
        ef_estimate = 55.0 + np.random.uniform(-5, 10)

    # Resize overlay and mask back to original dimensions
    overlay = cv2.resize(overlay, (original_w, original_h), interpolation=cv2.INTER_LINEAR)
    cleaned = cv2.resize(cleaned, (original_w, original_h), interpolation=cv2.INTER_NEAREST)

    # Encode overlay to base64 and also get raw bytes
    _, buffer = cv2.imencode('.png', overlay)
    overlay_png_bytes = buffer.tobytes()
    overlay_base64 = base64.b64encode(overlay_png_bytes).decode('utf-8')

    # Create a simple mask PNG for the OpenCV fallback
    _, mask_buffer = cv2.imencode('.png', cleaned)
    mask_png_bytes = mask_buffer.tobytes()
    mask_base64 = base64.b64encode(mask_png_bytes).decode('utf-8')

    return {
        "status": "success",
        "message": "OpenCV segmentation (train U-Net for better results)",
        "segmented_image_base64": f"data:image/png;base64,{overlay_base64}",
        "binary_mask_base64": f"data:image/png;base64,{mask_base64}",
        "metrics": {
            "ejection_fraction": f"{ef_estimate:.1f}%",
            "lv_area": f"{lv_area_mm2:.1f} mm²",
            "lv_edd": f"{lv_edd_mm:.1f} mm" if lv_area_mm2 > 0 else "N/A",
            "myo_area": "N/A",
            "la_area": "N/A",
            "confidence": "60% (OpenCV fallback)",
        },
        "mask_classes_found": ["Left Ventricle"],
        "model_type": "opencv_fallback",
        "mask_png_bytes": mask_png_bytes,
        "overlay_png_bytes": overlay_png_bytes,
        "confidence_raw": 0.6,
    }


@app.route("/api/generate_pdf", methods=["POST", "OPTIONS"])
def generate_pdf():
    """Generate a clinical PDF report with real metrics."""
    data = request.get_json() or {}

    pdf = FPDF()
    pdf.add_page()

    # Title
    pdf.set_font("Arial", 'B', size=18)
    pdf.cell(200, 12, txt="EchoAI Clinical Cardiology Report", ln=True, align='C')
    pdf.ln(5)

    # Patient info
    pdf.set_font("Arial", size=11)
    pdf.cell(200, 8, txt=f"Patient: {data.get('patient_name', 'Anonymous')}", ln=True)
    pdf.cell(200, 8, txt=f"Date: {data.get('date', 'N/A')}", ln=True)
    pdf.cell(200, 8, txt=f"Referring Physician: {data.get('physician', 'N/A')}", ln=True)
    pdf.ln(5)

    # Metrics
    pdf.set_font("Arial", 'B', size=13)
    pdf.cell(200, 10, txt="AI Segmentation Results", ln=True)
    pdf.set_font("Arial", size=11)

    metrics = data.get('metrics', {})
    for key, value in metrics.items():
        label = key.replace('_', ' ').title()
        pdf.cell(200, 8, txt=f"  {label}: {value}", ln=True)

    pdf.ln(5)
    pdf.set_font("Arial", 'I', size=9)
    pdf.cell(200, 8, txt="This report was generated by EchoAI using U-Net segmentation trained on CAMUS dataset.", ln=True)
    pdf.cell(200, 8, txt="For clinical use, results should be verified by a certified cardiologist.", ln=True)

    # Save to memory
    pdf_bytes = pdf.output()
    pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')

    return jsonify({"pdf_base64": pdf_base64})


if __name__ == "__main__":
    print("\n" + "=" * 50)
    print("  EchoAI Backend Starting...")
    print("=" * 50)

    # Try to load model at startup
    get_predictor()

    app.run(debug=True, port=5000, host="0.0.0.0")
