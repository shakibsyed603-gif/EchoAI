"""
EchoAI - U-Net Model Architecture for Cardiac Segmentation
===========================================================
A lightweight U-Net designed to segment echocardiography images from the CAMUS dataset.

Segments 4 classes:
  0 = Background
  1 = Left Ventricle (LV)
  2 = Myocardium (MYO)
  3 = Left Atrium (LA)
"""

import torch
import torch.nn as nn
import torch.nn.functional as F


class DoubleConv(nn.Module):
    """Two consecutive Conv2D → BatchNorm → ReLU blocks (U-Net building block)."""

    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        return self.block(x)


class UNet(nn.Module):
    """
    U-Net for echocardiography segmentation.
    
    Architecture:
        Encoder (downsampling path):  1 → 64 → 128 → 256 → 512
        Bottleneck:                   512 → 1024
        Decoder (upsampling path):    1024 → 512 → 256 → 128 → 64
        Output:                       64 → num_classes
    
    Args:
        in_channels: Number of input channels (1 for grayscale echo images)
        num_classes: Number of segmentation classes (4 for CAMUS)
    """

    def __init__(self, in_channels=1, num_classes=4):
        super().__init__()

        # ============ ENCODER (Downsampling) ============
        self.enc1 = DoubleConv(in_channels, 64)
        self.enc2 = DoubleConv(64, 128)
        self.enc3 = DoubleConv(128, 256)
        self.enc4 = DoubleConv(256, 512)

        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)

        # ============ BOTTLENECK ============
        self.bottleneck = DoubleConv(512, 1024)

        # ============ DECODER (Upsampling) ============
        self.up4 = nn.ConvTranspose2d(1024, 512, kernel_size=2, stride=2)
        self.dec4 = DoubleConv(1024, 512)  # 512 (up) + 512 (skip) = 1024

        self.up3 = nn.ConvTranspose2d(512, 256, kernel_size=2, stride=2)
        self.dec3 = DoubleConv(512, 256)   # 256 + 256 = 512

        self.up2 = nn.ConvTranspose2d(256, 128, kernel_size=2, stride=2)
        self.dec2 = DoubleConv(256, 128)   # 128 + 128 = 256

        self.up1 = nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2)
        self.dec1 = DoubleConv(128, 64)    # 64 + 64 = 128

        # ============ OUTPUT ============
        self.output_conv = nn.Conv2d(64, num_classes, kernel_size=1)

    def forward(self, x):
        # Encoder
        e1 = self.enc1(x)               # (B, 64, H, W)
        e2 = self.enc2(self.pool(e1))    # (B, 128, H/2, W/2)
        e3 = self.enc3(self.pool(e2))    # (B, 256, H/4, W/4)
        e4 = self.enc4(self.pool(e3))    # (B, 512, H/8, W/8)

        # Bottleneck
        b = self.bottleneck(self.pool(e4))  # (B, 1024, H/16, W/16)

        # Decoder with skip connections
        d4 = self.up4(b)                          # (B, 512, H/8, W/8)
        d4 = self.dec4(torch.cat([d4, e4], dim=1))  # concat skip → (B, 1024, ...) → (B, 512, ...)

        d3 = self.up3(d4)
        d3 = self.dec3(torch.cat([d3, e3], dim=1))

        d2 = self.up2(d3)
        d2 = self.dec2(torch.cat([d2, e2], dim=1))

        d1 = self.up1(d2)
        d1 = self.dec1(torch.cat([d1, e1], dim=1))

        # Output: per-pixel class logits
        return self.output_conv(d1)      # (B, num_classes, H, W)


# ============ LOSS FUNCTION ============
class DiceLoss(nn.Module):
    """
    Dice Loss for segmentation tasks.
    Better than CrossEntropy for imbalanced classes (background >> LV).
    """

    def __init__(self, smooth=1.0):
        super().__init__()
        self.smooth = smooth

    def forward(self, predictions, targets):
        # predictions: (B, C, H, W) raw logits
        # targets: (B, H, W) class indices
        num_classes = predictions.shape[1]
        predictions = F.softmax(predictions, dim=1)

        # One-hot encode targets: (B, H, W) → (B, C, H, W)
        targets_one_hot = F.one_hot(targets.long(), num_classes)  # (B, H, W, C)
        targets_one_hot = targets_one_hot.permute(0, 3, 1, 2).float()  # (B, C, H, W)

        # Calculate Dice per class
        intersection = (predictions * targets_one_hot).sum(dim=(2, 3))
        union = predictions.sum(dim=(2, 3)) + targets_one_hot.sum(dim=(2, 3))

        dice = (2.0 * intersection + self.smooth) / (union + self.smooth)

        # Average across all classes and batch
        return 1.0 - dice.mean()


class CombinedLoss(nn.Module):
    """CrossEntropy + Dice Loss combined for best convergence."""

    def __init__(self, dice_weight=0.5, ce_weight=0.5):
        super().__init__()
        self.dice = DiceLoss()
        self.ce = nn.CrossEntropyLoss()
        self.dice_weight = dice_weight
        self.ce_weight = ce_weight

    def forward(self, predictions, targets):
        return (self.dice_weight * self.dice(predictions, targets) +
                self.ce_weight * self.ce(predictions, targets.long()))


# ============ QUICK TEST ============
if __name__ == "__main__":
    model = UNet(in_channels=1, num_classes=4)

    # Count parameters
    total_params = sum(p.numel() for p in model.parameters())
    print(f"U-Net Parameters: {total_params:,}")
    print(f"Model Size: ~{total_params * 4 / 1024 / 1024:.1f} MB")

    # Test forward pass
    dummy_input = torch.randn(2, 1, 256, 256)  # Batch of 2 grayscale images
    output = model(dummy_input)
    print(f"Input shape:  {dummy_input.shape}")
    print(f"Output shape: {output.shape}")  # Should be (2, 4, 256, 256)
