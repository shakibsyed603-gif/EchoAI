import torch
import torch.nn as nn


class ResidualBlock(nn.Module):

    def __init__(self, channels):
        super().__init__()

        self.block = nn.Sequential(
            nn.Conv2d(channels, channels, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(channels, channels, kernel_size=3, padding=1)
        )

        self.relu = nn.ReLU(inplace=True)

    def forward(self, x):

        identity = x

        out = self.block(x)

        out += identity

        out = self.relu(out)

        return out


class EchoEnhancerV2(nn.Module):

    def __init__(self):
        super().__init__()

        self.entry = nn.Sequential(
            nn.Conv2d(1, 64, kernel_size=3, padding=1),
            nn.ReLU(inplace=True)
        )

        self.res1 = ResidualBlock(64)
        self.res2 = ResidualBlock(64)

        self.exit = nn.Sequential(
            nn.Conv2d(64, 32, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(32, 1, kernel_size=3, padding=1),
            nn.Sigmoid()
        )

    def forward(self, x):

        x = self.entry(x)

        x = self.res1(x)

        x = self.res2(x)

        x = self.exit(x)

        return x