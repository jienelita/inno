import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { router, usePage } from '@inertiajs/react';
import Webcam from 'react-webcam';
import { Button, Dropdown, Image, MenuProps, message, Modal, Upload } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
// Types
type UploadType = 'magrow' | 'valid' | 'coMakerMagrowID' | 'coMakerValidID' | null;
type ModalContentType = 'upload' | 'camera' | null;
interface LoanData {
  loanAmount: number;
  term: number;
  paymentMode: number;
  insurance?: number;
  tabname: number;
  results?: {
    netProceeds?: number;
    interestPerPayment?: number;
    principal?: number;
    totalInterest?: number;
    capitalRetention?: number;
    serviceFee?: number;
    amortization?: any[];
  };
}

interface AdditionalRequirmentsProps {
  loanData: LoanData;
  gallery?: {
    image_path: string,
    image_name: string
  }[];
  onClose: () => void;
}

const Additionalrequirments: React.FC<AdditionalRequirmentsProps> = ({ loanData, gallery, onClose }) => {
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);
  const [modalContentType, setModalContentType] = useState<ModalContentType>(null);
  const [currentUploadType, setCurrentUploadType] = useState<UploadType>(null);
  const [magrowImage, setMagrowImage] = useState<File | null>(null);
  const [validImage, setValidImage] = useState<File | null>(null);
  const [magrowPreview, setMagrowPreview] = useState<string | null>(null);
  const [validPreview, setValidPreview] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [magrowGalleryImage, setMagrowGalleryImage] = useState<string | null>(null);
  const [validGalleryImage, setValidGalleryImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [supportingImages, setSupportingImages] = useState<File[]>([]);
  const [supportingPreview, setSupportingPreview] = useState<string[]>([]);
  const [supportingVisible, setSupportingVisible] = useState(false);
  const [draggerKey, setDraggerKey] = useState(0);
  const warningShown = useRef(false);
  const [coMakerMagrowImage, setCoMakerMagrowImage] = useState<File | null>(null);
  const [coMakerValidImage, setCoMakerValidImage] = useState<File | null>(null);

  const [coMakerMagrowPreview, setCoMakerMagrowPreview] = useState<string | null>(null);
  const [coMakerValidPreview, setCoMakerValidPreview] = useState<string | null>(null);
  
  const [coMakerMagrowGalleryImage, setCoMakerMagrowGalleryImage] = useState<string | null>(null);
  const [coMakerValidGalleryImage, setCoMakerValidGalleryImage] = useState<string | null>(null);


  const clear = () => sigCanvas.current?.clear();

  const handleMenuClick = (key: string, type: UploadType) => {
    setCurrentUploadType(type);
    if (key === '1') {
      setModalContentType('upload');
      setModalVisible(true);
    } else if (key === '2') {
      setModalContentType('camera');
      setModalVisible(true);
    } else if (key === '3') {
      setGalleryVisible(true); // 👈 open gallery modal
    }
  };

  // const handleUploadChange = (info: any) => {
  //   const latestFile = info.fileList?.[info.fileList.length - 1]?.originFileObj;
  //   if (!latestFile) return;
  //   const reader = new FileReader();
  //   reader.onload = (e) => {
  //     const base64 = e.target?.result as string;
  //     if (currentUploadType === 'magrow') {
  //       setMagrowImage(latestFile);
  //       setMagrowPreview(base64);
  //     } else if (currentUploadType === 'valid') {
  //       setValidImage(latestFile);
  //       setValidPreview(base64);
  //     }
  //   };
  //   reader.readAsDataURL(latestFile);
  //   setModalVisible(false);
  // };


  // const handleCapturePhoto = () => {
  //   if (!webcamRef.current) return;
  //   const screenshot = webcamRef.current.getScreenshot();
  //   if (screenshot) {
  //     const photoFile = base64ToFile(screenshot, `photo_${Date.now()}.jpg`);

  //     if (currentUploadType === 'magrow') {
  //       setMagrowImage(photoFile);
  //       setMagrowPreview(screenshot); // for preview
  //     } else if (currentUploadType === 'valid') {
  //       setValidImage(photoFile);
  //       setValidPreview(screenshot); // for preview
  //     }
  //   }
  //   setModalVisible(false);
  // };

  const handleSelfieCapture = () => {
    if (!webcamRef.current) return;
    const screenshot = webcamRef.current.getScreenshot();
    if (screenshot) {
      setCapturedImage(screenshot); // optional for preview
      setSelfieFile(base64ToFile(screenshot, `selfie_${Date.now()}.jpg`)); // <-- if you want File for selfie
      setModalType(null);
    }
  };
  const galleryImages = gallery?.map(img => `/images/${img.image_name}`) || [];

  const handleUploadChange = (info: any) => {
    const latestFile = info.fileList?.[info.fileList.length - 1]?.originFileObj;
    if (!latestFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;

      switch (currentUploadType) {
        case 'magrow':
          setMagrowImage(latestFile);
          setMagrowPreview(base64);
          break;
        case 'valid':
          setValidImage(latestFile);
          setValidPreview(base64);
          break;
        case 'coMakerMagrowID':
          setCoMakerMagrowImage(latestFile);
          setCoMakerMagrowPreview(base64);
          break;
        case 'coMakerValidID':
          setCoMakerValidImage(latestFile);
          setCoMakerValidPreview(base64);
          break;
      }
    };

    reader.readAsDataURL(latestFile);
    setModalVisible(false);
  };

  const handleCapturePhoto = () => {
    if (!webcamRef.current) return;
    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) return;

    const photoFile = base64ToFile(screenshot, `photo_${Date.now()}.jpg`);

    switch (currentUploadType) {
      case 'magrow':
        setMagrowImage(photoFile);
        setMagrowPreview(screenshot);
        break;
      case 'valid':
        setValidImage(photoFile);
        setValidPreview(screenshot);
        break;
      case 'coMakerMagrowID':
        setCoMakerMagrowImage(photoFile);
        setCoMakerMagrowPreview(screenshot);
        break;
      case 'coMakerValidID':
        setCoMakerValidImage(photoFile);
        setCoMakerValidPreview(screenshot);
        break;
    }

    setModalVisible(false);
  };

  const handleSelectGalleryImage = (imgUrl: string) => {
    switch (currentUploadType) {
      case 'magrow':
        setMagrowPreview(imgUrl);
        setMagrowImage(null);
        setMagrowGalleryImage(imgUrl);
        break;
      case 'valid':
        setValidPreview(imgUrl);
        setValidImage(null);
        setValidGalleryImage(imgUrl);
        break;
      case 'coMakerMagrowID':
        setCoMakerMagrowPreview(imgUrl);
        setCoMakerMagrowImage(null);
         setCoMakerMagrowGalleryImage(imgUrl);
        break;
      case 'coMakerValidID':
        setCoMakerValidPreview(imgUrl);
        setCoMakerValidImage(null);
        setCoMakerValidGalleryImage(imgUrl);
        break;
    }

    setGalleryVisible(false);
  };




  /* const handleSelectGalleryImage = (imgUrl: string) => {
    if (currentUploadType === 'magrow') {
      setMagrowPreview(imgUrl);
      setMagrowImage(null); // clear File because using old image
      setMagrowGalleryImage(imgUrl); // save the gallery URL
    } else if (currentUploadType === 'valid') {
      setValidPreview(imgUrl);
      setValidImage(null); // clear File
      setValidGalleryImage(imgUrl); // save gallery URL
    }
    setGalleryVisible(false); // close modal
  }; */


  const saveToLaravel = () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      message.error("No signature found. Please sign first.");
      return;
    }
    if (!magrowImage && !magrowGalleryImage) {
      message.error("Please upload, take a photo, or select from gallery for Borrower Magrow ID.");
      return;
    }

    if (!validImage && !validGalleryImage) {
      message.error("Please upload, take a photo, or select from gallery for Borrower Valid ID.");
      return;
    }

    if (!capturedImage) {
      message.error("Please take a Selfie.");
      return;
    }

    setLoading(true); // start spinning

    const formData = new FormData();

    supportingImages.forEach((file, index) => {
      formData.append(`supporting_docs[${index}]`, file);
    });

    const signatureBase64 = sigCanvas.current.toDataURL('image/png');
    const signatureFile = base64ToFile(signatureBase64, `signature_${Date.now()}.png`);

    formData.append('loan_amount', loanData.loanAmount.toString());
    formData.append('term', loanData.term.toString());
    formData.append('payment_mode', loanData.paymentMode.toString());
    formData.append('tabName', loanData.tabname.toString());

    if (loanData.results?.netProceeds !== undefined) {
      formData.append('netProceeds', loanData.results.netProceeds.toString());
    }
    if (loanData.results?.interestPerPayment !== undefined) {
      formData.append('interestPerPayment', loanData.results.interestPerPayment.toString());
    }
    if (loanData.results?.principal !== undefined) {
      formData.append('principal', loanData.results.principal.toString());
    }
    if (loanData.results?.totalInterest !== undefined) {
      formData.append('totalInterest', loanData.results.totalInterest.toString());
    }
    if (loanData.results?.serviceFee !== undefined) {
      formData.append('serviceFee', loanData.results.serviceFee.toString());
    }
    if (loanData.results?.capitalRetention !== undefined) {
      formData.append('capitalRetention', loanData.results.capitalRetention.toString());
    }
    if (loanData.insurance !== undefined) {
      formData.append('insurance', loanData.insurance.toString());
    }
    if (magrowImage) {
      formData.append('magrow_id', magrowImage);
    } else if (magrowGalleryImage) {
      formData.append('magrow_gallery', magrowGalleryImage);
    }
    if (validImage) {
      formData.append('valid_id', validImage);
    } else if (validGalleryImage) {
      formData.append('valid_gallery', validGalleryImage);
    }
    if (capturedImage) {
      const selfieFile = base64ToFile(capturedImage, `selfie_${Date.now()}.jpg`);
      formData.append('selfie', selfieFile);
    }
    if (signatureFile) {
      formData.append('signature', signatureFile);
    }
    if (coMakerMagrowImage) {
      formData.append('co_maker_magrow_id', coMakerMagrowImage);
    } else if (coMakerMagrowGalleryImage) {
      formData.append('co_maker_magrow_gallery', coMakerMagrowGalleryImage);
    }
    if (coMakerValidImage) {
      formData.append('co_maker_valid_id', coMakerValidImage);
    } else if (coMakerValidGalleryImage) {
      formData.append('co_maker_valid_id_gallery', coMakerValidGalleryImage);
    }
    router.post('/loan-applications', formData, {
      forceFormData: true,
      onSuccess: () => {
        setLoading(false); // stop spinning
        message.success('Application submitted!');
        router.visit('/loans');
        onClose();
      },
      onError: () => {
        setLoading(false); // stop spinning
        message.error("Submission failed.");
      },
    });
  };
  function base64ToFile(base64String: string, filename: string): File {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime || 'image/jpeg' });
  }
  const renderDropdown = (
    type: UploadType, label: string, image: File |
      null, setImage: React.Dispatch<React.SetStateAction<File |
        null>>, preview: string |
          null, setPreview: React.Dispatch<React.SetStateAction<string |
            null>>) => {
    const menuItems: MenuProps['items'] = [
      {
        key: '1',
        label: <div onClick={() => handleMenuClick('1', type)}>Upload from device</div>,
      },
      {
        key: '2',
        label: <div onClick={() => handleMenuClick('2', type)}>Take photo</div>,
      },
      {
        key: '3',
        label: <div onClick={() => handleMenuClick('3', type)}>Select Images From Gallery.</div>,
      },
    ];

    return (
      <div className="mb-4">
        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
          <Button>{label}</Button>
        </Dropdown>

        {preview && (
          <div className="mt-2 flex items-center gap-2">
            <img
              src={preview}
              alt={label}
              className="w-32 h-auto rounded shadow border"
            />
            <span>{label}</span>
            <Button
              shape="circle"
              icon={<DeleteOutlined />}
              onClick={() => {
                setImage(null);
                setPreview(null);
              }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <label className="block mb-1 text-gray-600 font-semibold">Magrow Employee ID:</label>
      {renderDropdown('magrow', 'Borrower MAGROW ID', magrowImage, setMagrowImage, magrowPreview, setMagrowPreview)}
      {renderDropdown('valid', 'Borrower Valid ID', validImage, setValidImage, validPreview, setValidPreview)}
      <hr className='mb-4' />
      <label className="block mb-1 text-gray-600 font-semibold">Co-Maker ID:</label>
      {renderDropdown('coMakerMagrowID', 'Co-maker MAGROW ID', coMakerMagrowImage, setCoMakerMagrowImage, coMakerMagrowPreview, setCoMakerMagrowPreview)}
      {renderDropdown('coMakerValidID', 'Co-maker Valid ID', coMakerValidImage, setCoMakerValidImage, coMakerValidPreview, setCoMakerValidPreview)}


      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={modalContentType === 'camera' ? handleCapturePhoto : undefined}
        okText={modalContentType === 'camera' ? 'Capture' : 'OK'}
        footer={modalContentType === 'camera' ? undefined : null}
      >
        {modalContentType === 'upload' && (
          <Upload.Dragger
            accept="image/*"
            beforeUpload={() => false}
            showUploadList={false}
            onChange={handleUploadChange}
          >
            <p className="ant-upload-drag-icon">📁</p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
          </Upload.Dragger>
        )}
        {modalContentType === 'camera' && (
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="rounded w-full"
            videoConstraints={{ facingMode: 'user', width: 640, height: 480 }}
            width={640}
            height={480}
          />
        )}
      </Modal>
      <hr className='mb-4' />
      <label className="block mb-1 text-gray-600 font-semibold mt-4">Selfie:</label>
      <Button type="primary" onClick={() => setModalType('camera')}>Take Selfie</Button>
      <Modal
        open={modalType === 'camera'}
        onOk={handleSelfieCapture}
        onCancel={() => {
          setModalType(null);
          // STOP CAMERA TRACKS
          const mediaStream = webcamRef.current?.video?.srcObject as MediaStream;
          if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
          }
        }}
      >
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="rounded w-full"
          videoConstraints={{ facingMode: 'user', width: 640, height: 480 }}
          width={640}
          height={480}
        />
      </Modal>

      <Modal
        open={galleryVisible}
        title="Select from Gallery"
        onCancel={() => setGalleryVisible(false)}
        footer={null}
      >
        <div className="grid grid-cols-3 gap-4">
          {galleryImages.map((imgUrl) => (
            <div key={imgUrl} className="cursor-pointer" onClick={() => handleSelectGalleryImage(imgUrl)}>
              <img src={imgUrl} alt="Gallery" className="rounded shadow border" />
            </div>
          ))}

        </div>
      </Modal>

      {capturedImage && (
        <div className="mt-4 flex flex-col items-start gap-2">
          <div className="relative">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-64 rounded shadow border"
            />
            <button
              onClick={() => setCapturedImage(null)}
              className="absolute top-1 right-1 bg-white/80 hover:bg-white text-red-500 rounded-full p-1 shadow"
              title="Delete"
            >
              <DeleteOutlined />
            </button>
          </div>
          <button
            onClick={() => setModalType('camera')}
            className="text-blue-500 hover:underline text-sm"
          >
            Retake Photo
          </button>
        </div>
      )}
      <hr className='mb-4 mt-5' />
      <label className="block mb-1 text-gray-600 font-semibold mt-4">Signature:</label>
      <SignatureCanvas
        ref={sigCanvas}
        penColor="black"
        canvasProps={{ width: 680, height: 200, className: 'border rounded' }}
      />
      <div className="mt-2">
        <button onClick={clear} className="px-4 py-2 bg-gray-200 rounded mr-2 mb-5">Clear</button>

        <div className="mb-4">
          <Button onClick={() => setSupportingVisible(true)}>Upload 3 Most Recent Payslip</Button>

          {supportingPreview.length > 0 && (
            <>
              <div className="mt-2 flex flex-wrap gap-3">
                {supportingPreview.map((src, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={src}
                      alt={`Supporting ${idx + 1}`}
                      className="w-32 h-auto rounded shadow border"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-2">
                <Button
                  type="default"
                  danger
                  onClick={() => {
                    setSupportingImages([]);
                    setSupportingPreview([]);
                    setDraggerKey(prev => prev + 1); // reset the Upload.Dragger
                  }}
                >
                  Delete All Supporting Images
                </Button>
              </div>
            </>
          )}
        </div>

        <Modal
          open={supportingVisible}
          onCancel={() => setSupportingVisible(false)}
          footer={null}
          title="Upload up to 3 Supporting Documents"
        >
          <Upload.Dragger
            key={draggerKey}
            accept="image/*"
            multiple
            beforeUpload={() => false}
            showUploadList={false}
            onChange={(info) => {
              const rawFiles = info.fileList.map(f => f.originFileObj).filter(Boolean);
              if (rawFiles.length > 3) {
                if (!warningShown.current) {
                  message.warning("Please upload exactly 3 images.");
                  warningShown.current = true;

                  setDraggerKey(prev => prev + 1);

                  setSupportingImages([]);
                  setSupportingPreview([]);

                  // Clear warning flag after delay (optional)
                  setTimeout(() => {
                    warningShown.current = false;
                  }, 2000);
                }
                return;
              }
              if (rawFiles.length !== 3) {
                message.warning("Please upload exactly 3 images.");
                return;
              }
              const previews: string[] = [];
              let readCount = 0;

              rawFiles.forEach((file, idx) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  previews[idx] = e.target?.result as string;
                  readCount++;

                  if (readCount === rawFiles.length) {
                    setSupportingImages(rawFiles);
                    setSupportingPreview(previews);
                    setSupportingVisible(false);
                    setDraggerKey(prev => prev + 1); // reset uploader
                  }
                };
                reader.readAsDataURL(file);
              });
            }}
          >
            <p className="ant-upload-drag-icon">📁</p>
            <p className="ant-upload-text">Drag or select <strong>exactly 3 images</strong></p>
          </Upload.Dragger>
        </Modal>
        <hr />
        <button
          onClick={saveToLaravel}
          className={`px-4 py-2 rounded ${loading ? 'bg-blue-400' : 'bg-blue-500'} text-white mt-5`}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"></path>
              </svg>
              Submitting...
            </span>
          ) : (
            'Save'
          )}
        </button>

      </div>
    </div>
  );
};

export default Additionalrequirments;