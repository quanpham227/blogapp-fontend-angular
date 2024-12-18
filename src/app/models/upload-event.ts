import { Image } from './image';

export interface UploadProgressEvent {
  status: 'progress';
  message: number;
}

export interface UploadSuccessEvent {
  status: 'OK';
  data: Image;
}

export interface UploadErrorEvent {
  status: 'error';
  message: string;
}

export interface UnhandledEvent {
  status: 'unhandled';
  message: string;
}
export interface UploadSentEvent {
  status: 'sent';
  message: string;
}
export interface ResponseHeaderEvent {
  status: 'responseHeader';
  message: string;
}
export interface DownloadProgressEvent {
  status: 'downloadProgress';
  message: string;
}
export type UploadEvent =
  | UploadProgressEvent
  | UploadSuccessEvent
  | UploadErrorEvent
  | UnhandledEvent
  | UploadSentEvent
  | ResponseHeaderEvent
  | DownloadProgressEvent;
