import {
  Component,
  Input,
  Output,
  EventEmitter,
  NgZone,
  AfterViewInit,
  forwardRef,
  SimpleChanges,
  OnDestroy,
  OnChanges,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { from } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SharedDataService } from '../../services/help-text.service';

declare let tinymce: any;

@UntilDestroy()
@Component({
  selector: 'app-tinymce-editor',
  standalone: true,
  imports: [FormsModule, EditorModule],
  templateUrl: './tinymce-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TinymceEditorComponent),
      multi: true,
    },
  ],
})
export class TinymceEditorComponent implements ControlValueAccessor, AfterViewInit, OnDestroy, OnChanges {
  @Input() content: string = '';
  @Input() editorConfig: any = {};
  @Input() helpText: string = '';
  @Output() contentChange = new EventEmitter<string>();

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  editorInstance: any;
  isEditorReady = false;
  helpTextElement: HTMLElement | null = null;

  constructor(
    private dialog: MatDialog,
    private zone: NgZone,
    private sharedDataService: SharedDataService,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit() {
    this.sharedDataService.helpText$.pipe(untilDestroyed(this)).subscribe((helpText) => {
      this.helpText = helpText ?? ''; // Sử dụng toán tử nullish coalescing
      if (this.helpTextElement && helpText) {
        this.helpTextElement.innerHTML = helpText;
      }
      this.cdr.markForCheck(); // Đánh dấu để kiểm tra thay đổi
    });
  }

  ngAfterViewInit() {
    try {
      tinymce.init({
        target: document.getElementById('tinymce-editor'),
        ...this.mergedConfig,
        setup: (editor: any) => {
          this.editorInstance = editor;
          editor.on('init', () => {
            this.isEditorReady = true;
            this.writeValue(this.content);
          });

          editor.on('change', () => {
            const newContent = editor.getContent();
            this.contentChange.emit(newContent);
          });
        },
      });
      console.log('helpText in tinymce component', this.helpText);
    } catch (error) {
      console.error('Error initializing TinyMCE:', error);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isEditorReady) {
      if (changes['helpText'] && this.helpTextElement) {
        console.log('HelpText change detected:', changes['helpText'].currentValue);

        const newHelpText = changes['helpText'].currentValue;
        if (newHelpText) {
          this.helpTextElement.innerHTML = newHelpText;
        }
      }
      if (changes['content']) {
        const newContent = changes['content'].currentValue;
        if (newContent !== undefined) {
          this.writeValue(newContent);
        }
      }
      this.cdr.markForCheck();
    }
  }
  defaultConfig = {
    base_url: '/assets/tinymce',
    suffix: '.min',
    height: 200,
    menubar: false,
    license_key: 'gpl',
    branding: false,
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
      'emoticons',
      'autosave',
      'quickbars',
      'directionality',
      'visualchars',
    ],
    toolbar: [
      'blocks formatselect fontsizeselect fontselect | bold italic underline strikethrough forecolor backcolor alignleft aligncenter alignright alignjustify bullist numlist outdent indent',
      'removeformat undo redo | link customInsertImage media table emoticons charmap fullscreen code preview | insertdatetime anchor hr visualblocks visualchars spellchecker wordcount | customInsertLocation customRemoveElement ltr rtl help',
    ],
    paste_data_images: true,
    paste_as_text: true,
    content_css: ['/assets/tinymce/skins/ui/oxide/content.min.css', '/assets/tinymce/skins/ui/oxide/skin.min.css'],
    content_style: `
      body { font-size:14px }
      .tox-statusbar__branding, .tox-statusbar__upgrade, .tox-promotion { display: none; }
      img { max-width: 100%; height: auto; }
    `,
    setup: (editor: any) => {
      editor.ui.registry.addButton('customInsertImage', {
        icon: 'image',
        tooltip: 'Insert Image',
        onAction: () => {
          this.openImageModal(editor);
        },
      });

      editor.ui.registry.addButton('customRemoveElement', {
        icon: 'remove',
        tooltip: 'Remove Element',
        onAction: () => {
          const selectedNode = editor.selection.getNode();
          if (selectedNode) {
            editor.dom.remove(selectedNode);
          }
        },
      });

      editor.on('init', () => {
        const upgradeElement = document.querySelector('.tox-promotion') as HTMLElement;
        if (upgradeElement) {
          upgradeElement.style.display = 'none';
        }

        const pathElement = document.querySelector('.tox-statusbar__path') as HTMLElement;
        if (pathElement) {
          pathElement.style.display = 'none';
        }

        this.helpTextElement = document.querySelector('.tox-statusbar__help-text') as HTMLElement;
        if (this.helpTextElement) {
          this.helpTextElement.innerHTML = this.helpText;
          this.helpTextElement.style.flex = '1';
        }

        const resizeHandleElement = document.querySelector('.tox-statusbar__resize-handle') as HTMLElement;
        if (resizeHandleElement) {
          resizeHandleElement.style.position = 'absolute';
          resizeHandleElement.style.right = '0';
          resizeHandleElement.style.bottom = '0';
        }
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
    this.cdr.markForCheck();
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

  ngOnDestroy() {
    if (this.editorInstance) {
      tinymce.remove(this.editorInstance);
    }
  }

  onContentChange(content: string) {
    this.contentChange.emit(content);
    this.cdr.markForCheck();
  }

  handleEvent(event: any) {}

  openImageModal(editor: any) {
    this.zone.run(() => {
      import('../admin/shared/image-select-dialog/image-select-dialog.component').then(({ ImageSelectDialogAdminComponent }) => {
        const dialogRef = this.dialog.open(ImageSelectDialogAdminComponent, {
          width: '1000px',
          data: {},
        });

        from(dialogRef.afterClosed())
          .pipe(untilDestroyed(this))
          .subscribe({
            next: (result: { url: string; publicId: string }) => {
              if (result) {
                editor.insertContent(`<img class="content-image" src="${result.url}" alt="Image" loading="lazy" />`);
              }
            },
            error: (reason) => {
              console.error('Dialog dismissed:', reason);
            },
          });
      });
    });
  }
}
