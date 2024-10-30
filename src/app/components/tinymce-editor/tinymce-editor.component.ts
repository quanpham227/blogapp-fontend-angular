import {
  Component,
  Input,
  Output,
  EventEmitter,
  NgZone,
  AfterViewInit,
  forwardRef,
  SimpleChanges,
} from '@angular/core';
import {
  FormsModule,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ImageSelectModalAdminComponent } from '../admin/shared/components/image-select-modal/image-select-modal.admin.component';

declare var tinymce: any; // Khai báo biến toàn cục

@Component({
  selector: 'app-tinymce-editor',
  standalone: true,
  imports: [FormsModule, EditorModule],
  templateUrl: './tinymce-editor.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TinymceEditorComponent),
      multi: true,
    },
  ],
})
export class TinymceEditorComponent
  implements ControlValueAccessor, AfterViewInit
{
  @Input() content: string = '';
  @Input() editorConfig: any = {}; // Nhận cấu hình tùy chỉnh từ component cha
  @Input() helpText: string = ''; // Nhận dòng chữ tùy chỉnh từ component cha
  @Output() contentChange = new EventEmitter<string>();

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  editorInstance: any; // Store editor instance for later use
  isEditorReady = false; // Biến cờ để theo dõi trạng thái khởi tạo của editor

  constructor(
    private modalService: NgbModal,
    private zone: NgZone,
  ) {}

  defaultConfig = {
    base_url: '/assets/tinymce', // Đảm bảo đường dẫn này đúng
    suffix: '.min',
    height: 200,
    menubar: false,
    license_key: 'gpl', // Thêm dòng này để đồng ý với các điều khoản của giấy phép mã nguồn mở
    branding: false, // Thêm dòng này để ẩn chữ "Built with TinyMCE"
    plugins: [
      'advlist', // Advanced List - danh sách nâng cao
      'autolink', // Tự động tạo liên kết khi gõ
      'lists', // Tạo danh sách (ul, ol)
      'link', // Chèn/Chỉnh sửa liên kết
      'image', // Chèn/Chỉnh sửa ảnh
      'charmap', // Chèn ký tự đặc biệt
      'preview', // Xem trước nội dung
      'anchor', // Chèn mỏ neo (anchor)
      'searchreplace', // Tìm kiếm và thay thế
      'visualblocks', // Hiển thị khối div (block)
      'code', // Chỉnh sửa code HTML
      'fullscreen', // Chế độ toàn màn hình
      'insertdatetime', // Chèn ngày giờ
      'media', // Chèn media (video, audio)
      'table', // Tạo và chỉnh sửa bảng
      'help', // Hiển thị trợ giúp
      'wordcount', // Đếm từ trong nội dung
      'emoticons', // Chèn emoji
      'autosave', // Tự động lưu bản nháp
      'quickbars', // Thanh công cụ ngữ cảnh
      'directionality', // Hỗ trợ nội dung RTL và LTR
      'visualchars', // Hiển thị ký tự ẩn
    ],
    toolbar: [
      'blocks formatselect | bold italic underline strikethrough forecolor backcolor alignleft aligncenter alignright alignjustify bullist numlist outdent indent | removeformat | undo redo | link customInsertImage media table emoticons charmap fullscreen code preview searchreplace ',
      'fontsizeselect fontselect insertdatetime anchor hr visualblocks visualchars spellchecker wordcount | image editimage customInsertLocation customRemoveElement imagetools ltr rtl help',
    ],
    paste_data_images: true, // Cho phép dán hình ảnh từ clipboard
    paste_as_text: true, // Dán nội dung dưới dạng văn bản thuần túy
    content_css: [
      '/assets/tinymce/skins/ui/oxide/content.min.css',
      '/assets/tinymce/skins/ui/oxide/skin.min.css',
    ],

    content_style: `
    body { font-family:Helvetica,Arial,sans-serif; font-size:14px }
    .tox-statusbar__branding, .tox-statusbar__upgrade, .tox-promotion { display: none; }
    img { max-width: 100%; height: auto; } 
  `,

    setup: (editor: any) => {
      // Ghi đè hành động mặc định của nút "Insert Image"
      editor.ui.registry.addButton('customInsertImage', {
        icon: 'image',
        tooltip: 'Insert Image',
        onAction: () => {
          this.openImageModal(editor);
        },
      });

      // Thêm nút tùy chỉnh để xóa phần tử hiện tại
      editor.ui.registry.addButton('customRemoveElement', {
        icon: 'remove', // Sử dụng biểu tượng Font Awesome
        tooltip: 'Remove Element',
        onAction: () => {
          const selectedNode = editor.selection.getNode();
          if (selectedNode) {
            editor.dom.remove(selectedNode);
          }
        },
      });

      // Thêm đoạn mã này để loại bỏ phần tử "Upgrade"
      editor.on('init', () => {
        const upgradeElement = document.querySelector(
          '.tox-promotion',
        ) as HTMLElement;
        if (upgradeElement) {
          upgradeElement.style.display = 'none';
        }

        // Loại bỏ phần tử "tox-statusbar__path"
        const pathElement = document.querySelector(
          '.tox-statusbar__path',
        ) as HTMLElement;
        if (pathElement) {
          pathElement.style.display = 'none';
        }
        // Thay đổi hoặc loại bỏ dòng chữ "Press ⌥0 for help"
        const helpTextElement = document.querySelector(
          '.tox-statusbar__help-text',
        ) as HTMLElement;
        if (helpTextElement) {
          helpTextElement.innerHTML = this.helpText; // Thay đổi dòng chữ
          helpTextElement.style.flex = '1'; // Chiếm toàn bộ chiều rộng còn lại
        }
        // Di chuyển phần tử "tox-statusbar__resize-handle" sang góc phải
        const resizeHandleElement = document.querySelector(
          '.tox-statusbar__resize-handle',
        ) as HTMLElement;
        if (resizeHandleElement) {
          resizeHandleElement.style.position = 'absolute';
          resizeHandleElement.style.right = '0';
          resizeHandleElement.style.bottom = '0';
        }
        console.log(this.helpText);
      });

      editor.on('Change', () => {
        const content = editor.getContent();
        this.onChange(content);
        this.onTouched();
      });
    },
  };

  get mergedConfig() {
    return { ...this.defaultConfig, ...this.editorConfig, license_key: 'gpl' };
  }

  writeValue(value: any): void {
    if (this.editorInstance && this.isEditorReady) {
      this.editorInstance.setContent(value);
    } else {
      this.content = value;
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (this.isEditorReady && this.editorInstance) {
      this.editorInstance.setMode(isDisabled ? 'readonly' : 'design');
    } else {
      // Lưu trạng thái disabled để áp dụng sau khi editor được khởi tạo
      this.zone.runOutsideAngular(() => {
        const checkEditorReady = setInterval(() => {
          if (this.isEditorReady && this.editorInstance) {
            clearInterval(checkEditorReady);
            this.editorInstance.setMode(isDisabled ? 'readonly' : 'design');
          }
        }, 100);
      });
    }
  }

  ngAfterViewInit() {
    tinymce.init({
      target: document.getElementById('tinymce-editor'),
      ...this.mergedConfig,
      setup: (editor: any) => {
        this.editorInstance = editor; // Lưu trữ instance của editor
        editor.on('init', () => {
          console.log('TinyMCE initialized');
          this.isEditorReady = true; // Đánh dấu editor đã khởi tạo
          this.writeValue(this.content); // Thiết lập nội dung sau khi khởi tạo
        });

        editor.on('change', () => {
          const newContent = editor.getContent(); // Lấy nội dung mới
          this.contentChange.emit(newContent); // Phát sự kiện nội dung thay đổi
        });
      },
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isEditorReady) {
      // Chỉ thực hiện các thay đổi nếu editor đã sẵn sàng
      if (changes['content']) {
        this.writeValue(changes['content'].currentValue);
      }
    }
  }

  onContentChange(content: string) {
    this.contentChange.emit(content);
  }

  handleEvent(event: any) {}

  openImageModal(editor: any) {
    this.zone.run(() => {
      const modalRef = this.modalService.open(ImageSelectModalAdminComponent, {
        centered: true,
        backdrop: 'static',
        keyboard: true,
        windowClass: 'admin-image-modal',
        size: 'lg',
      });

      modalRef.result.then(
        (result: { url: string; publicId: string }) => {
          if (result) {
            editor.insertContent(
              `<img class="content-image" src="${result.url}" alt="Image" loading="lazy" />`,
            );
          }
        },
        (reason) => {
          console.log('Modal dismissed: ' + reason);
        },
      );
    });
  }
}
