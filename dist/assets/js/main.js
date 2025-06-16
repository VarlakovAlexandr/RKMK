const phoneInputs = document.querySelectorAll('input[name="phone"]');
if ( phoneInputs.length ){
    phoneInputs.forEach( inp => {
        let mask = IMask(inp, {
            mask: '+{7} 000 000 00-00',
			
            lazy: true,  // make placeholder always visible
            placeholderChar: '_'     // defaults to '_'
        })

		inp.addEventListener('focus', function(){
			mask.updateOptions({
				lazy: false,
			});
		})
		inp.addEventListener('blur', function(){
			mask.updateOptions({
				lazy: true,
			});
		})
    } )
}


const inputs = document.querySelectorAll('.input');

if ( inputs.length ){
    inputs.forEach( inp => {
        inp.addEventListener('input', function(){
            const parent = this.closest('.input-block');
            parent.classList.remove('has-error');

            if ( this.value.length > 0 ){
                parent.classList.add('has-text');
            } else{
                parent.classList.remove('has-text');
            }
        })
    } )
}


const resetInputBtns = document.querySelectorAll('.input-block__reset');

if ( resetInputBtns.length ){
    resetInputBtns.forEach( btn => {
        btn.addEventListener('click', function(){
            const parent = this.closest('.input-block');

            parent.classList.remove('has-text');
            parent.querySelector('.input').value = '';
        })
    })
}


const pageContactsForm = document.querySelector('.page-contacts-form');
const formSuccess = document.querySelector('.form-success')





if ( pageContactsForm ){
    pageContactsForm.addEventListener('submit', function(event){
        event.preventDefault();

        const requiredInputs = this.querySelectorAll('.input:required');
       
        const submitBtn = document.querySelector('.cf-submit');

        submitBtn.setAttribute('disabled', 'disabled');

        requiredInputs.forEach( inp => {
            if ( inp.value.length < 1 ){
                const parent = inp.closest('.input-block');
                parent.classList.add('has-error');
            }
        } )



        setTimeout(()=>{
            this.reset();
            submitBtn.removeAttribute('disabled');
            
            const hookAnimationStart = () => {
                formSuccess.classList.remove('start');    
                formSuccess.classList.add('active');    
                formSuccess.removeEventListener('animationend', hookAnimationStart);
            }

            formSuccess.addEventListener('animationend', hookAnimationStart);
            formSuccess.classList.add('start');
        }, 2000)

    })
}


const messageCloseBtns = document.querySelectorAll('[data-message-close]');

if ( messageCloseBtns.length ){
    messageCloseBtns.forEach( btn => {

        btn.addEventListener('click', function(){
            const message = this.closest('.message');

            const animationHook = () => {

                message.classList.remove('active');
                message.classList.remove('hide');
                message.removeEventListener( 'animationend', animationHook )
            }
            
            message.addEventListener( 'animationend', animationHook )

            message.classList.add('hide');
        })

    } )
}


document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.querySelector('.loaded-files');
    if (!fileInput) return;

    const parentContainer = fileInput.closest('.cf-file-uploads');
    if (!parentContainer) return;

    const filesContainer = parentContainer.querySelector('.cf-files');
    if (!filesContainer) return;

    let currentFiles = [];

    // --- Основной обработчик загрузки файлов ---
    fileInput.addEventListener('change', function(e) {
        currentFiles = Array.from(e.target.files);
        filesContainer.innerHTML = '';

        if (currentFiles.length > 0) {
            parentContainer.classList.add('has-files');
            currentFiles.forEach(file => {
                if (validateFile(file)) {
                    filesContainer.appendChild(createFileElement(file));
                } else {
                    // Удаляем невалидный файл из массива
                    currentFiles = currentFiles.filter(f => f.name !== file.name);
                }
            });
            
            // Обновляем input после валидации
            updateFileInput(fileInput, currentFiles);
        } else {
            parentContainer.classList.remove('has-files');
        }
    });

    // --- Создание элемента файла в интерфейсе ---
    function createFileElement(file) {
        const fileElement = document.createElement('div');
        fileElement.className = 'cf-file';
        fileElement.dataset.fileName = encodeURIComponent(file.name);

        fileElement.innerHTML = `
            <span class="cf-file__text">
                <span class="cf-file__filename">${escapeHtml(file.name)}</span>
                <span class="cf-file__filevalue">${formatFileSize(file.size)}</span>
            </span>
            <span class="cf-file__remove" title="Удалить файл">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.48653 8.96781L7.1592 21H16.8433L18.516 8.96781H5.48653ZM11.2465 16.5889C11.2465 17.2695 10.6499 17.8206 9.91299 17.8206C9.1761 17.8206 8.57944 17.2695 8.57944 16.5889V12.8537C8.57944 12.1731 9.1761 11.622 9.91299 11.622C10.6499 11.622 11.2465 12.1731 11.2465 12.8537V16.5889ZM15.4206 16.5889C15.4206 17.2695 14.8239 17.8206 14.087 17.8206C13.3501 17.8206 12.7535 17.2695 12.7535 16.5889V12.8537C12.7535 12.1731 13.3501 11.622 14.087 11.622C14.8239 11.622 15.4206 12.1731 15.4206 12.8537V16.5889Z" fill="#262626"/>
                    <path d="M14.9871 4.154V3H9.01036V4.154C9.01036 4.83698 8.58199 5.38807 8.05418 5.38807H4V7.66545H20V5.38807H15.9458C15.418 5.38807 14.9896 4.83462 14.9896 4.154H14.9871Z" fill="#262626"/>
                </svg>
            </span>
        `;

        // Обработчик удаления файла
        fileElement.querySelector('.cf-file__remove').addEventListener('click', () => {
            const fileName = decodeURIComponent(fileElement.dataset.fileName);
            currentFiles = currentFiles.filter(f => f.name !== fileName);
            
            updateFileInput(fileInput, currentFiles);
            fileElement.remove();
            
            if (currentFiles.length === 0) {
                parentContainer.classList.remove('has-files');
            }
        });

        return fileElement;
    }

    // --- Обновление состояния input ---
    function updateFileInput(input, filesToKeep) {
        const dataTransfer = new DataTransfer();
        filesToKeep.forEach(file => dataTransfer.items.add(file));
        input.files = dataTransfer.files;
    }

    // --- Валидация файлов ---
    function validateFile(file) {
        const MAX_SIZE_MB = 10;
        const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        // Проверка размера
        if (file.size > MAX_SIZE) {
            alert(`Файл "${file.name}" превышает максимальный размер ${MAX_SIZE_MB}MB`);
            return false;
        }
        
        // Проверка типа файла
        if (!allowedTypes.includes(file.type)) {
            alert(`Файл "${file.name}" имеет недопустимый формат`);
            return false;
        }
        
        return true;
    }

    // --- Форматирование размера файла ---
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        const units = ['KB', 'MB', 'GB'];
        const decimals = 2;
        let i = 0;
        
        while (bytes >= 1024 && i < units.length) {
            bytes /= 1024;
            i++;
        }
        
        return parseFloat(bytes.toFixed(decimals)) + ' ' + units[i - 1];
    }

    // --- Экранирование HTML ---
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});