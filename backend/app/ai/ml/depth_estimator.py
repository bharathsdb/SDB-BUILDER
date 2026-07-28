"""
Depth Estimator - Estimates depth from single images for 3D reconstruction.
Uses monocular depth estimation heuristics with OpenCV.
"""
import cv2
import numpy as np
import logging

logger = logging.getLogger(__name__)


class DepthEstimator:
    def estimate(self, image: np.ndarray) -> np.ndarray:
        """
        Estimate depth map from a single RGB image.
        Returns a grayscale depth map where brighter = closer.
        """
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        h, w = gray.shape

        # Use Laplacian for edge-based depth cues
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        edge_magnitude = np.abs(laplacian)

        # Use contrast as depth proxy (higher contrast = closer)
        blur = cv2.GaussianBlur(gray, (15, 15), 0)
        contrast = cv2.absdiff(gray, blur)

        # Create depth gradient (bottom = closer for ground)
        y_gradient = np.tile(np.linspace(0, 1, h)[:, np.newaxis], (1, w))

        # Combine cues
        depth = (edge_magnitude / (edge_magnitude.max() + 1e-6)) * 0.3
        depth += (contrast / (contrast.max() + 1e-6)) * 0.3
        depth += y_gradient * 0.4

        depth = cv2.GaussianBlur(depth, (31, 31), 0)
        depth = (depth / depth.max() * 255).astype(np.uint8)

        return depth

    def point_cloud_from_depth(self, depth: np.ndarray, fov: float = 60.0) -> np.ndarray:
        h, w = depth.shape
        fx = w / (2 * np.tan(np.radians(fov / 2)))
        fy = h / (2 * np.tan(np.radians(fov / 2)))
        cx, cy = w / 2, h / 2

        ys, xs = np.meshgrid(np.arange(h), np.arange(w), indexing="ij")
        z = depth.astype(np.float32) / 255.0 * 10.0  # Scale to 10 units max

        points = np.zeros((h * w, 3), dtype=np.float32)
        points[:, 0] = (xs.ravel() - cx) * z.ravel() / fx
        points[:, 1] = (ys.ravel() - cy) * z.ravel() / fy
        points[:, 2] = z.ravel()

        return points
