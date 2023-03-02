from typing import Tuple, Union
import numpy as np
import figurl as fig


class LabelingStack:
    def __init__(self, *,
        width: int,
        height: int,
        num_frames: int,
        mjpeg_uri: str,
        annotation_uri: Union[str, None]=None
    ) -> None:
        self.width = width
        self.height = height
        self.num_frames = num_frames
        self.mjpeg_uri = mjpeg_uri
        self.annotation_uri = annotation_uri
    def url(self, *, label: str):
        d = {
            'type': 'spa.LabelingStack',
            'width': self.width,
            'height': self.height,
            'numFrames': self.num_frames,
            'mjpegUri': self.mjpeg_uri
        }
        if self.annotation_uri is not None:
            d['annotationUri'] = self.annotation_uri
        F = fig.Figure(
            data=d,
            view_url='https://scratchrealm.github.io/skeleton-pose-annotator/v1'
        )
        return F.url(label=label)