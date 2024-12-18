import { Image } from './image';

interface UploadProgressEvent {
  status: 'progress';
  message: number;
}

interface UploadSuccessEvent {
  status: 'OK';
  data: Image;
}

interface UploadErrorEvent {
  status: 'error';
  message: string;
}

type UploadEvent = UploadProgressEvent | UploadSuccessEvent | UploadErrorEvent;
