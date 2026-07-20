"""
EchoAI - U-Net Training Script
================================
Trains the U-Net model on CAMUS echocardiography dataset.

Usage:
    python train.py
    python train.py --epochs 50 --batch_size 8 --lr 0.001
"""

import os
import sys
import time
import argparse
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim.lr_scheduler import ReduceLROnPlateau

from model import UNet, CombinedLoss, DiceLoss
from dataset import get_data_loaders


def calculate_dice_score(predictions, targets, num_classes=4):
    """Calculate per-class Dice scores for evaluation."""
    predictions = torch.argmax(predictions, dim=1)  # (B, H, W)
    dice_scores = {}
    class_names = ['Background', 'LV', 'Myocardium', 'Left Atrium']

    for cls in range(num_classes):
        pred_cls = (predictions == cls).float()
        target_cls = (targets == cls).float()

        intersection = (pred_cls * target_cls).sum()
        union = pred_cls.sum() + target_cls.sum()

        if union == 0:
            dice = 1.0  # Both empty = perfect match
        else:
            dice = (2.0 * intersection / (union + 1e-8)).item()

        dice_scores[class_names[cls]] = dice

    # Mean Dice (excluding background)
    dice_scores['Mean (no BG)'] = np.mean([
        dice_scores[c] for c in ['LV', 'Myocardium', 'Left Atrium']
    ])

    return dice_scores


def train_one_epoch(model, train_loader, criterion, optimizer, device):
    """Train for one epoch."""
    print("[DEBUG] Entering train_one_epoch()")
    model.train()
    total_loss = 0
    num_batches = 0

    print(f"[DEBUG] About to enter DataLoader loop for training...")
    for images, masks in train_loader:
        if num_batches == 0:
            print(f"[DEBUG] Processing batch 0. Images shape: {images.shape}")
            
        images = images.to(device)
        masks = masks.to(device)

        if num_batches == 0:
            print("[DEBUG] Before forward pass")
            
        # Forward pass
        outputs = model(images)
        
        if num_batches == 0:
            print("[DEBUG] After forward pass, before loss calculation")
            
        loss = criterion(outputs, masks)

        if num_batches == 0:
            print("[DEBUG] Before optimizer.zero_grad() & backward")
            
        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        
        if num_batches == 0:
            print("[DEBUG] Before optimizer.step()")
            
        optimizer.step()
        
        if num_batches == 0:
            print("[DEBUG] After optimizer.step()")

        total_loss += loss.item()
        num_batches += 1

    return total_loss / num_batches


def validate(model, val_loader, criterion, device):
    """Validate the model."""
    model.eval()
    total_loss = 0
    num_batches = 0
    all_dice_scores = []

    with torch.no_grad():
        for images, masks in val_loader:
            images = images.to(device)
            masks = masks.to(device)

            outputs = model(images)
            loss = criterion(outputs, masks)

            total_loss += loss.item()
            num_batches += 1

            # Calculate Dice scores
            dice = calculate_dice_score(outputs, masks)
            all_dice_scores.append(dice)

    # Average Dice scores across batches
    avg_dice = {}
    for key in all_dice_scores[0]:
        avg_dice[key] = np.mean([d[key] for d in all_dice_scores])

    return total_loss / num_batches, avg_dice


def train(args):
    """Main training loop."""
    print("=" * 60)
    print("  EchoAI — U-Net Training on CAMUS Dataset")
    print("=" * 60)

    # ── Device Setup ──
    if torch.cuda.is_available():
        device = torch.device('cuda')
        print(f"\n🚀 Using GPU: {torch.cuda.get_device_name(0)}")
    else:
        device = torch.device('cpu')
        print("\n⚠️  Using CPU (training will be slower)")
        print("   For faster training, use Google Colab with GPU runtime")

    # ── Data Loading ──
    print(f"\n📂 Loading CAMUS dataset from: {args.data_dir}")
    print("[DEBUG] Before DataLoader creation (get_data_loaders)")
    train_loader, val_loader, dataset_info = get_data_loaders(
        data_dir=args.data_dir,
        image_size=args.image_size,
        batch_size=args.batch_size,
        val_split=0.2,
        num_workers=args.num_workers
    )
    print("[DEBUG] After DataLoader creation")

    # ── Model ──
    model = UNet(in_channels=1, num_classes=4).to(device)
    total_params = sum(p.numel() for p in model.parameters())
    print(f"\n🧠 U-Net Model:")
    print(f"   Parameters: {total_params:,}")
    print(f"   Size: ~{total_params * 4 / 1024 / 1024:.1f} MB")

    # ── Loss & Optimizer ──
    criterion = CombinedLoss(dice_weight=0.5, ce_weight=0.5)
    optimizer = optim.Adam(model.parameters(), lr=args.lr, weight_decay=1e-5)
    scheduler = ReduceLROnPlateau(optimizer, mode='min', patience=5, factor=0.5)

    # ── Training Loop ──
    best_val_loss = float('inf')
    best_dice = 0.0
    patience_counter = 0
    os.makedirs(args.save_dir, exist_ok=True)

    print(f"\n🏋️ Training for {args.epochs} epochs...")
    print(f"   Learning rate: {args.lr}")
    print(f"   Early stopping patience: {args.patience}")
    print("-" * 60)

    print("\n[DEBUG] Before training loop starts")
    for epoch in range(1, args.epochs + 1):
        start_time = time.time()

        # Train
        train_loss = train_one_epoch(model, train_loader, criterion, optimizer, device)

        # Validate
        val_loss, val_dice = validate(model, val_loader, criterion, device)

        # Learning rate scheduling
        scheduler.step(val_loss)

        elapsed = time.time() - start_time
        current_lr = optimizer.param_groups[0]['lr']

        # Print progress
        print(f"Epoch [{epoch:3d}/{args.epochs}] "
              f"Train Loss: {train_loss:.4f} | "
              f"Val Loss: {val_loss:.4f} | "
              f"Dice LV: {val_dice['LV']:.3f} | "
              f"Dice MYO: {val_dice['Myocardium']:.3f} | "
              f"Dice LA: {val_dice['Left Atrium']:.3f} | "
              f"Mean: {val_dice['Mean (no BG)']:.3f} | "
              f"LR: {current_lr:.6f} | "
              f"Time: {elapsed:.1f}s")

        # Save best model
        # Fix: Save if it's the first epoch, or if dice is better than best_dice
        current_mean_dice = val_dice['Mean (no BG)']
        if epoch == 1 or current_mean_dice > best_dice:
            best_dice = max(best_dice, current_mean_dice)
            best_val_loss = val_loss
            patience_counter = 0

            save_path = os.path.join(args.save_dir, 'unet_camus.pth')
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'val_loss': val_loss,
                'val_dice': val_dice,
                'dataset_info': dataset_info,
                'image_size': args.image_size,
            }, save_path)
            print(f"   ✅ Best model saved! (Dice: {best_dice:.4f})")
        else:
            patience_counter += 1

        # Early stopping
        if patience_counter >= args.patience:
            print(f"\n⏹️  Early stopping at epoch {epoch} (no improvement for {args.patience} epochs)")
            break

    # ── Final Summary ──
    print("\n" + "=" * 60)
    print("  Training Complete!")
    print("=" * 60)
    print(f"  Best Validation Loss: {best_val_loss:.4f}")
    print(f"  Best Mean Dice Score: {best_dice:.4f}")
    print(f"  Model saved to: {os.path.join(args.save_dir, 'unet_camus.pth')}")
    print("=" * 60)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Train EchoAI U-Net on CAMUS')

    # Paths
    parser.add_argument('--data_dir', type=str,
                        default=os.path.join(os.path.dirname(__file__), '..', 'data', 'camus', 'database_nifti'),
                        help='Path to CAMUS training directory')
    parser.add_argument('--save_dir', type=str,
                        default=os.path.join(os.path.dirname(__file__), 'models'),
                        help='Directory to save trained model')

    # Training hyperparameters
    parser.add_argument('--epochs', type=int, default=50, help='Number of training epochs')
    parser.add_argument('--batch_size', type=int, default=8, help='Batch size')
    parser.add_argument('--lr', type=float, default=0.001, help='Learning rate')
    parser.add_argument('--image_size', type=int, default=256, help='Image size (square)')
    parser.add_argument('--patience', type=int, default=10, help='Early stopping patience')
    parser.add_argument('--num_workers', type=int, default=0, help='Data loading workers')

    args = parser.parse_args()
    train(args)
