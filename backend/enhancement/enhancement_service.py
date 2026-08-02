"""
enhancement_service.py
----------------------
Loads the trained EchoEnhancerV2 (best_model_v2.pth) once at module import
time and exposes a single reusable function:

    enhance_with_residual_cnn(image: np.ndarray) -> np.ndarray

The model is loaded onto GPU if CUDA is available, otherwise CPU.
The model is kept in evaluation mode and is never retrained here.
"""

import os
import logging
import cv2
import numpy as np
import torch

# Import the architecture defined by the user — do NOT modify that file.
from enhancement.residual_enhancer import EchoEnhancerV2

# ─── Configuration ────────────────────────────────────────────────────────────

# The model was trained on 256×256 grayscale frames.
MODEL_INPUT_SIZE: int = 256

# Resolve the absolute path to the weights file, regardless of the working
# directory from which the Flask server is started.
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
WEIGHTS_PATH = os.path.join(_THIS_DIR, "best_model_v2.pth")

# ─── Logging ─────────────────────────────────────────────────────────────────

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── Device Selection ────────────────────────────────────────────────────────

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
logger.info("[EnhancementService] Using device: %s", DEVICE)

# ─── Model Loading (once at import time) ─────────────────────────────────────

def _load_model() -> EchoEnhancerV2:
    """Instantiate EchoEnhancerV2, load weights, and move to the target device."""
    if not os.path.isfile(WEIGHTS_PATH):
        raise FileNotFoundError(
            f"[EnhancementService] Weights not found at: {WEIGHTS_PATH}"
        )

    model = EchoEnhancerV2()

    state_dict = torch.load(WEIGHTS_PATH, map_location=DEVICE)
    model.load_state_dict(state_dict)

    model.to(DEVICE)
    model.eval()  # Inference mode — disables dropout / batch-norm training

    logger.info(
        "[EnhancementService] EchoEnhancerV2 loaded successfully from: %s",
        WEIGHTS_PATH,
    )
    return model


# Module-level singleton — loaded once when the backend starts.
_model: EchoEnhancerV2 = _load_model()

# ─── Public API ───────────────────────────────────────────────────────────────

def enhance_with_residual_cnn(image: np.ndarray) -> np.ndarray:
    """
    Run Residual CNN inference on an OpenCV image.

    Parameters
    ----------
    image : np.ndarray
        Input image as returned by cv2.imread() — BGR or grayscale,
        any resolution.

    Returns
    -------
    np.ndarray
        Enhanced grayscale image with the same spatial dimensions as the
        input (uint8, values 0-255).
    """

    # ── 1. Convert to grayscale ──────────────────────────────────────────────
    if image is None:
        raise ValueError("[EnhancementService] Received a None image.")

    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image.copy()

    original_h, original_w = gray.shape

    # ── 2. Resize to model input resolution ──────────────────────────────────
    resized = cv2.resize(
        gray,
        (MODEL_INPUT_SIZE, MODEL_INPUT_SIZE),
        interpolation=cv2.INTER_LINEAR,
    )

    # ── 3. Normalise to [0, 1] and build PyTorch tensor ──────────────────────
    # Shape: (H, W) -> (1, 1, H, W)  [batch=1, channels=1]
    tensor = torch.from_numpy(resized.astype(np.float32) / 255.0)
    tensor = tensor.unsqueeze(0).unsqueeze(0)  # add batch and channel dims
    tensor = tensor.to(DEVICE)

    # ── 4. Inference (no gradient tracking needed) ───────────────────────────
    with torch.no_grad():
        output: torch.Tensor = _model(tensor)

    # ── 5. Convert output tensor back to a NumPy image ───────────────────────
    # Shape: (1, 1, H, W) -> (H, W)
    enhanced_array = (
        output.squeeze().cpu().numpy() * 255.0
    ).clip(0, 255).astype(np.uint8)

    # ── 6. Restore original spatial resolution ───────────────────────────────
    if (original_h, original_w) != (MODEL_INPUT_SIZE, MODEL_INPUT_SIZE):
        enhanced_array = cv2.resize(
            enhanced_array,
            (original_w, original_h),
            interpolation=cv2.INTER_LINEAR,
        )

    return enhanced_array
