import React, { useRef, useEffect, useState, useCallback } from 'react';

// Make sure the global `faceLandmarksDetection` is available from the script tag
declare const faceLandmarksDetection: any;
declare const tf: any;

interface HeadTrackerProps {
  onJump: () => void;
  showCamera: boolean;
}

const HeadTracker: React.FC<HeadTrackerProps> = ({ onJump, showCamera }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const modelRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastYRef = useRef<number | null>(null);
  const jumpCooldownRef = useRef(false);

  const [status, setStatus] = useState('Initializing...');

  const detectHeadNod = useCallback(() => {
    (async () => {
      if (videoRef.current && modelRef.current && videoRef.current.readyState === 4) {
        try {
          const predictions = await modelRef.current.estimateFaces({
            input: videoRef.current,
          });

          if (predictions.length > 0) {
            // Use the nose tip keypoint (index 1) as a reference for vertical movement
            const noseTip = predictions[0].scaledMesh[1];
            const currentY = noseTip[1];

            if (lastYRef.current !== null) {
              const deltaY = lastYRef.current - currentY;
              // Detect a significant upward movement (negative deltaY)
              if (deltaY > 6 && !jumpCooldownRef.current) {
                onJump();
                jumpCooldownRef.current = true;
                setTimeout(() => {
                  jumpCooldownRef.current = false;
                }, 500); // 500ms cooldown to prevent multiple jumps
              }
            }
            lastYRef.current = currentY;
          }
        } catch (error) {
          console.error("Error during face estimation:", error);
        }
      }
      animationFrameRef.current = requestAnimationFrame(detectHeadNod);
    })();
  }, [onJump]);

  const setupCameraAndModel = useCallback(async () => {
    // This function waits for the TF.js scripts to be loaded from the CDN.
    const waitForScripts = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        const timeout = 10000; // 10 seconds timeout
        const interval = 100; // check every 100ms
        let elapsedTime = 0;

        const checkScripts = () => {
          // Check if both tf and faceLandmarksDetection are loaded and initialized.
          if (
            typeof (window as any).tf !== 'undefined' &&
            typeof (window as any).faceLandmarksDetection !== 'undefined' &&
            (window as any).faceLandmarksDetection.SupportedPackages
          ) {
            resolve();
          } else {
            elapsedTime += interval;
            if (elapsedTime >= timeout) {
              reject(new Error("TensorFlow.js scripts failed to load in time."));
            } else {
              setTimeout(checkScripts, interval);
            }
          }
        };
        checkScripts();
      });
    };

    try {
      setStatus('Loading scripts...');
      await waitForScripts();

      setStatus('Requesting camera...');
      await tf.setBackend('webgl');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setStatus('Loading model...');
      modelRef.current = await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
        { maxFaces: 1 }
      );
      setStatus('Ready!');
      
      const onLoadedData = () => {
        if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(detectHeadNod);
      };

      if (videoRef.current) {
        videoRef.current.addEventListener('loadeddata', onLoadedData);
      }
      return () => {
        if(videoRef.current) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            videoRef.current.removeEventListener('loadeddata', onLoadedData);
        }
      }
    } catch (error) {
      console.error('Failed to setup camera or model:', error);
      if (error instanceof Error) {
          setStatus(`Error: ${error.message}`);
      } else {
          setStatus('Error: Please enable camera access.');
      }
    }
  }, [detectHeadNod]);
  
  useEffect(() => {
    setupCameraAndModel();
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [setupCameraAndModel]);

  return (
    <div className={`absolute bottom-4 left-4 w-40 h-30 rounded-lg overflow-hidden border-2 dark:border-gray-600 border-gray-400 bg-black transition-opacity duration-300 ${showCamera ? 'opacity-75' : 'opacity-0'}`}>
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scaleX(-1)"
        />
        {status !== 'Ready!' && showCamera && (
             <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xs text-center p-2">
                {status}
            </div>
        )}
    </div>
  );
};

export default HeadTracker;