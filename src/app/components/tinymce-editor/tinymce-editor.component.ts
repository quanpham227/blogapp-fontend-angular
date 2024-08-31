import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ImageSelectModalAdminComponent } from '../admin/shared/components/image-select-modal/image-select-modal.admin.component';

@Component({
  selector: 'app-tinymce-editor',
  standalone: true,
  imports: [FormsModule, EditorModule],
  templateUrl: './tinymce-editor.component.html',
})
export class TinymceEditorComponent {
  @Input() content: string = '';
  @Input() editorConfig: any = {}; // Nhận cấu hình tùy chỉnh từ component cha
  @Output() contentChange = new EventEmitter<string>();
  @Input() objectType: string = ''; // Nhận objectType từ component cha

  constructor(private modalService: NgbModal) {}

  defaultConfig = {
    base_url: '/assets/tinymce', // Đảm bảo đường dẫn này đúng
    suffix: '.min',
    height: 200,
    menubar: true,
    license_key: 'gpl', // Thêm dòng này để đồng ý với các điều khoản của giấy phép mã nguồn mở
    branding: false, // Thêm dòng này để ẩn chữ "Built with TinyMCE"
    plugins: [
      'advlist',
      'autolink',
      'lists',
      'link',
      'image',
      'charmap',
      'preview',
      'anchor',
      'searchreplace',
      'visualblocks',
      'code',
      'fullscreen',
      'insertdatetime',
      'media',
      'table',
      'help',
      'wordcount',
    ],
    toolbar:
      'undo redo | formatselect | bold italic backcolor | ' +
      'alignleft aligncenter alignright alignjustify | ' +
      'bullist numlist outdent indent | removeformat | help | customInsertImage',
    content_css: [
      '/assets/tinymce/skins/ui/oxide/content.min.css',
      '/assets/tinymce/skins/ui/oxide/skin.min.css',
    ],
    content_style: `
      body { font-family:Helvetica,Arial,sans-serif; font-size:14px }
      .tox-statusbar__branding, .tox-statusbar__upgrade { display: none; }
    `,
    setup: (editor: any) => {
      editor.ui.registry.addButton('customInsertImage', {
        text: 'Insert Image',
        onAction: () => {
          this.openImageModal(editor);
        },
      });
    },
  };

  get mergedConfig() {
    return { ...this.defaultConfig, ...this.editorConfig };
  }

  onContentChange(content: string) {
    this.contentChange.emit(content);
  }

  openImageModal(editor: any) {
    const modalRef = this.modalService.open(ImageSelectModalAdminComponent);
    modalRef.componentInstance.objectType = this.objectType; // Truyền objectType vào modal
    modalRef.result.then(
      (result: string) => {
        if (result) {
          editor.insertContent(`<img src="${result}" alt="Image" />`);
        }
      },
      (reason) => {
        console.log('Modal dismissed: ' + reason);
      },
    );
  }
}
