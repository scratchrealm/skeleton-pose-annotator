from typing import List
import cv2

def extract_video_frames(*, video_fname: str, output_fname: str, frame_indices: List[int], quality: int):
    vid = cv2.VideoCapture(video_fname)
    # height = int(vid.get(cv2.CAP_PROP_FRAME_HEIGHT))
    # width = int(vid.get(cv2.CAP_PROP_FRAME_WIDTH))
    # fps = vid.get(cv2.CAP_PROP_FPS)
    # num_frames = int(vid.get(cv2.CAP_PROP_FRAME_COUNT))
    
    with open(output_fname, 'wb') as f:
        for frame_index in frame_indices:
            vid.set(cv2.CAP_PROP_POS_FRAMES, frame_index)
            _, frame = vid.read()
            _, buffer = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, quality])
            f.write(buffer)