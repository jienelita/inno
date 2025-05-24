import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Modal, Slider, Button, Alert } from 'antd';
import getCroppedImg from './cropImage';
import { LoadingOutlined } from '@ant-design/icons';
interface Props {
  visible: boolean;
  imageSrc: string;
  aspectRatio?: number; // make it optional
  onClose: () => void;
  onSave: (blob: Blob) => void;
}

const ImageEasyCropModal: React.FC<Props> = ({ visible, imageSrc, aspectRatio = 4 / 3, onClose, onSave }) => {
  
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      setSaving(false);
      setSaving(true);
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onSave(blob);
    } catch (err) {
      console.error('Cropping failed', err);
    } finally {
      setSaving(false);
      onClose();
    }
  };

  return (
    <Modal open={visible} onCancel={onClose} footer={null} width={600}>
      <div className="mb-4 text-center font-semibold">Adjust the scale and drag to crop</div>
      <div className='mt-5 mb-5'>
        <Alert
          description="You are going to replace the file, make sure you crop it right."
          type="warning"
          showIcon
        />
      </div>
      <div style={{ position: 'relative', width: '100%', height: 400 }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      <div className="my-4 px-4">
        <label className="block mb-2 text-sm text-gray-700">Zoom / Scale</label>
        <Slider
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={setZoom}
        />
      </div>

      <div className="text-right px-4 pb-2">
        <Button onClick={onClose} className="mr-2">Cancel</Button>
        {/* <Button type="primary" loading={loadings[0]} onClick={handleSave}>
          Save Cropped Image
        </Button> */}
        <Button
          type="primary"
          onClick={handleSave}
          icon={saving ? <LoadingOutlined spin /> : null}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Cropped Image'}
        </Button>
      </div>
    </Modal>
  );
};

export default ImageEasyCropModal;
