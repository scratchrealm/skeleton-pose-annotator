# 3/2/23
# https://figurl.org/f?v=https://scratchrealm.github.io/skeleton-pose-annotator/v1&d=sha1://f8326bf87ca1a2ddf1923c02f9990d5628602447&label=annotation%20stack

import kachery_cloud as kcl
import skeleton_pose_annotator as spa
import cv2

video_uri = 'sha1://7eaff1ae554bb35391a4ade2c2c77266b80ff378?label=20190128_113421.mp4' # sleap insects example
video_fname = kcl.load_file(video_uri)

vid = cv2.VideoCapture(video_fname)
height = int(vid.get(cv2.CAP_PROP_FRAME_HEIGHT))
width = int(vid.get(cv2.CAP_PROP_FRAME_WIDTH))
fps = vid.get(cv2.CAP_PROP_FPS)
num_frames = int(vid.get(cv2.CAP_PROP_FRAME_COUNT))

frame_indices = [0, 30, 60, 90]

with kcl.TemporaryDirectory() as tmpdir:
    mjpeg_fname = f'{tmpdir}/video.mjpeg'
    spa.extract_video_frames(video_fname=video_fname, output_fname=mjpeg_fname, frame_indices=frame_indices, quality=90)
    mjpeg_uri = kcl.store_file(mjpeg_fname)

x = spa.LabelingStack(
    width=width,
    height=height,
    num_frames=len(frame_indices),
    mjpeg_uri=mjpeg_uri
)

url = x.url(label='annotation stack')
print(url)
