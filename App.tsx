import React, {useRef, useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import {RNCamera, Face} from 'react-native-camera';

// Request Camera Permission
async function requestCameraPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'App needs camera permission',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can use the camera');
    } else {
      console.log('Camera permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
}

// Request Audio Permission
async function requestAudioPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Audio Permission',
        message: 'App needs audio permission',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can use the audio');
    } else {
      console.log('Audio permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
}

// Define the type for the bounding box state
type BoundingBox = {
  width: number;
  height: number;
  x: number;
  y: number;
  yawAngle: number;
  rollAngle: number;
};

function App(): React.JSX.Element {
  const [type, setType] = useState(RNCamera.Constants.Type.front);
  const [box, setBox] = useState<BoundingBox | null>(null);

  const cameraRef = useRef<RNCamera>(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestCameraPermission();
      requestAudioPermission();
    }
  }, []);

  const handleFaceDetection = ({faces}: {faces: Face[]}) => {
    if (faces.length > 0) {
      const face = faces[0];

      console.log('Face detected:', face);

      if (face.smilingProbability !== undefined) {
        console.log(`Smiling Probability: ${face.smilingProbability}`);
      } else {
        console.log('Smiling Probability is undefined');
      }

      if (face.smilingProbability && face.smilingProbability > 0.5) {
        console.log('smile');
      }

      // Detect head turns based on yawAngle
      if (face.yawAngle > 15) {
        console.log('Turned right');
      } else if (face.yawAngle < -15) {
        console.log('Turned left');
      }

      setBox({
        width: face.bounds.size.width,
        height: face.bounds.size.height,
        x: face.bounds.origin.x,
        y: face.bounds.origin.y,
        yawAngle: face.yawAngle,
        rollAngle: face.rollAngle,
      });
    } else {
      setBox(null); // Reset box if no face is detected
    }
  };

  return (
    <View style={styles.container}>
      <Text>ss</Text>
      <RNCamera
        ref={cameraRef}
        style={styles.camera}
        type={type}
        captureAudio={false} // Set to true if you need audio capture
        onStatusChange={({cameraStatus}) => {
          if (cameraStatus === 'NOT_AUTHORIZED') {
            Alert.alert('Camera not authorized');
          }
        }}
        onFacesDetected={handleFaceDetection}
        faceDetectionClassifications={
          RNCamera.Constants.FaceDetection.Classifications.all
        } // Enable all classifications including smiles
        faceDetectionMode={RNCamera.Constants.FaceDetection.Mode.accurate} // Use accurate mode for better results
      />
      {box && (
        <View
          style={styles.bound({
            width: box.width,
            height: box.height,
            x: box.x,
            y: box.y,
          })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'gray',
  },
  camera: {
    flexGrow: 1,
    width: '100%', // Ensure the camera takes up the full width
    height: '100%', // Ensure the camera takes up the full height
  },
  bound: ({width, height, x, y}: BoundingBox) => ({
    position: 'absolute',
    top: y,
    left: x,
    height,
    width,
    borderWidth: 5,
    borderColor: 'red',
    zIndex: 3000,
  }),
});

export default App;
