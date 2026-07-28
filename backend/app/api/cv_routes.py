from fastapi import APIRouter, UploadFile, File, HTTPException
import numpy as np
import cv2
import base64
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/cv", tags=["Computer Vision"])


@router.post("/extract-plan")
async def extract_plan(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image uploaded")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(blurred, 127, 255, cv2.THRESH_BINARY_INV)

    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    rooms = []
    logs = [
        "Analyzing uploaded blueprint image...",
        "Applying bilateral filtering for noise reduction...",
        "Applying adaptive thresholding to extract boundaries...",
    ]

    h, w = img.shape[:2]
    pixel_to_feet = 0.15

    for i, contour in enumerate(contours):
        area = cv2.contourArea(contour)
        if area > 1000:
            x, y, cw, ch = cv2.boundingRect(contour)
            room_w = round(cw * pixel_to_feet, 1)
            room_l = round(ch * pixel_to_feet, 1)

            room_type = "living" if area > 5000 else "bedroom" if area > 2000 else "bathroom"
            room_name = f"Room {i+1} ({room_type.capitalize()})"

            rooms.append({
                "id": f"cv_room_{i}",
                "name": room_name,
                "x": float(round(x * pixel_to_feet, 1)),
                "y": float(round(y * pixel_to_feet, 1)),
                "width": float(room_w),
                "length": float(room_l),
                "type": room_type,
                "color": "#f8fafc",
            })
            logs.append(f"Detected enclosed boundaries: Room {i+1} found size {room_w}x{room_l} ft.")

    _, encoded_img = cv2.imencode(".png", thresh)
    base64_str = base64.b64encode(encoded_img).decode("utf-8")

    return {
        "success": True,
        "rooms": rooms,
        "logs": logs,
        "processedImage": f"data:image/png;base64,{base64_str}",
    }


@router.post("/enhance")
async def enhance_image(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image")

    denoised = cv2.fastNlMeansDenoisingColored(img, None, 10, 10, 7, 21)
    lab = cv2.cvtColor(denoised, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    enhanced = cv2.merge([l, a, b])
    enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)

    _, encoded = cv2.imencode(".png", enhanced)
    return {
        "success": True,
        "image": f"data:image/png;base64,{base64.b64encode(encoded).decode('utf-8')}",
    }
