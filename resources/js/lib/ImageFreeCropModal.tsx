import React, { useRef, useState } from 'react';
import { Modal, Button, Alert } from 'antd';
import { Cropper } from 'react-cropper';
import '../../css/cropper.css';
import { LoadingOutlined } from '@ant-design/icons';

const ImageFreeCropModal = ({ visible, imageSrc, onClose, onSave }) => {
  const cropperRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const handleSave = () => {
    setSaving(true);
    try {
      const cropper = cropperRef.current?.cropper;
      if (cropper) {
        cropper.getCroppedCanvas().toBlob((blob) => {
          if (blob) onSave(blob);
        }, 'image/jpeg');
      }
    } catch (err) {
      console.error('Cropping failed', err);
    } finally {
      onClose();
      setSaving(false); // stop spinning
    }

  };

  return (
    <Modal open={visible} onCancel={onClose} footer={null} width={600}>
      <div className='mt-5 mb-5'>
        <Alert
          description="You are going to replace the file, make sure you crop it right."
          type="warning"
          showIcon
        />
      </div>
      <Cropper
        src={imageSrc}
        style={{ height: 400, width: '100%' }}
        guides={true}
        viewMode={1}
        dragMode="move"
        scalable={true}
        zoomable={true}
        initialAspectRatio={NaN} // Freeform
        ref={cropperRef}
      />
      <div className="text-right mt-4">
        <Button onClick={onClose} className="mr-2">Cancel</Button>
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

export default ImageFreeCropModal;
