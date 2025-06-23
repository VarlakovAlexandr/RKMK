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


const pageContactsForm = document.querySelector('.contact-form form');
const formSuccess = document.querySelector('.form-success')





if ( pageContactsForm ){
    pageContactsForm.addEventListener('submit', function(event){
        event.preventDefault();

        const requiredInputs = this.querySelectorAll('.input.wpcf7-validates-as-required');
        
       
        const submitBtn = document.querySelector('.cf-submit');

        submitBtn.setAttribute('disabled', 'disabled');


        let formError = false;

        requiredInputs.forEach( inp => {
            if ( inp.value.length < 1 ){
                const parent = inp.closest('.input-block');
                parent.classList.add('has-error');

                formError = true;
            }
        } )


        document.addEventListener('wpcf7mailsent', function(event) {

            submitBtn.removeAttribute('disabled');

            
            const filesList = document.querySelector('.cf-files');
            const loadContainer = document.querySelector('.cf-file-uploads');
            filesList.innerHTML = '';
            loadContainer.classList.remove('load-state');
            loadContainer.classList.remove('has-files');
            
            const hasTextBlocks = document.querySelectorAll('.input-block.has-text');

            if ( hasTextBlocks.length )  {

                hasTextBlocks.forEach( bl => {
                    bl.classList.remove('has-text');
                } )
            }
                
            const hookAnimationStart = () => {
                formSuccess.classList.remove('start');    
                formSuccess.classList.add('active');    
                formSuccess.removeEventListener('animationend', hookAnimationStart);
            }

            formSuccess.addEventListener('animationend', hookAnimationStart);
            formSuccess.classList.add('start');
            
        });


       
        

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

    const startLoadBtn = document.querySelector('.cf-file-uploads__btn');
    if (!startLoadBtn) return;

    const fileInput = document.querySelector('.loaded-files');
    if (!fileInput) return;

    const thisForm = fileInput.closest('form');
    if (!fileInput) return;


    const parentContainer = fileInput.closest('.cf-file-uploads');
    if (!parentContainer) return;

    const filesContainer = parentContainer.querySelector('.cf-files');
    if (!filesContainer) return;

    const dropZone = parentContainer.querySelector('.cf-load-file-zone');
    if (!dropZone) return;

    

    let currentFiles = [];


    startLoadBtn.addEventListener('click', function(){
        parentContainer.classList.add('load-state')
    })


    // --- Обработчики для drag-and-drop с дозагрузкой ---
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            // Создаем новый DataTransfer для объединения файлов
            const dataTransfer = new DataTransfer();
            
            // Добавляем уже выбранные файлы
            if (fileInput.files) {
                for (let file of fileInput.files) {
                    dataTransfer.items.add(file);
                }
            }
            
            // Добавляем новые файлы из перетаскивания
            for (let file of e.dataTransfer.files) {
                if (validateFile(file)) { // Проверяем валидность перед добавлением
                    dataTransfer.items.add(file);
                }
            }
            
            // Обновляем input и триггерим событие
            fileInput.files = dataTransfer.files;
            const event = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(event);
        }
    });




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
            updateFileInputs(thisForm, fileInput, currentFiles);
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
            
            updateFileInputs(thisForm, fileInput, currentFiles);
            fileElement.remove();
            
            if (currentFiles.length === 0) {
                parentContainer.classList.remove('has-files');
            }
        });

        return fileElement;
    }

    // --- Обновление состояния input ---
    /*function updateFileInput(input, filesToKeep) {
        const dataTransfer = new DataTransfer();
        filesToKeep.forEach(file => dataTransfer.items.add(file));
        input.files = dataTransfer.files;


    }*/


function updateFileInputs(form, bufferInput, filesToKeep) {
    // 1. Обновляем буферный input (multiple)
    
    const bufferDT = new DataTransfer();
    filesToKeep.forEach(file => bufferDT.items.add(file));
    bufferInput.files = bufferDT.files;
    
    // 2. Очищаем все слоты CF7 (file-0, file-1...)
    const slots = Array.from({length: 10}, (_, i) => 
        form.querySelector(`input[name="file-${i}"]`)
    ).filter(Boolean);
    
    slots.forEach(slot => {
        slot.value = ''; // Очищаем слот
    });
    
    // 3. Заполняем слоты файлами (1 файл на слот)
    filesToKeep.forEach((file, index) => {
        if (index >= 10) return; // Не превышаем лимит слотов
        
        const slot = slots[index];
        if (slot) {
            const slotDT = new DataTransfer();
            slotDT.items.add(file);
            slot.files = slotDT.files;
            
            // Триггерим событие для CF7
            slot.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
    
   
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

const toUp = document.querySelector('.footer-to-up');

if ( toUp ){
    toUp.addEventListener('click', function(e) {
            e.preventDefault(); 
        
            
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        
        }
    );
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('input[type="file"]')) {
      document.querySelector('input[type="file"]').setAttribute('multiple', 'multiple');
    }


    const text404 = document.querySelector('.text-block-404');

    if ( text404 ){
        const header = document.querySelector('.header');
        let headerHeight = header.offsetHeight;
        
        text404.style.marginTop = (headerHeight * -1) + 'px';

        window.addEventListener('resize', function(){
            headerHeight = header.offsetHeight;
            text404.style.marginTop = (headerHeight * -1) + 'px';
        })
    }
});


const sliderWhereUse = new Swiper(".swiper.where-use-slider", {
    speed: 1000,    
    slidesPerView: 'auto',
    navigation: {
        nextEl: '.where-use__nav .slider-nav.slider-next',
        prevEl: '.where-use__nav .slider-nav.slider-prev',
    },
    breakpoints: {
        320: {
            slidesPerView: 'auto',
            spaceBetween: 10
        },
        744: {
            slidesPerView: 'auto',
            spaceBetween: 14
        },
    }
})

let slider = new Swiper(".swiper.slider-advantages", {
    speed: 1000,
    
    
    spaceBetween: 0,
    
    breakpoints: {
        579: {
            slidesPerView: 'auto',
            spaceBetween: 24
        },
        1023: {
            slidesPerView: 3,
            spaceBetween: 24
        }
    }
})

const sliderIndexCategories = new Swiper(".swiper.i-categories", {
    speed: 1000,    
    slidesPerView: 'auto',
    spaceBetween: 12,
    navigation: {
        nextEl: '.si-categories__slider-nav .slider-nav.slider-next',
        prevEl: '.si-categories__slider-nav .slider-nav.slider-prev',
    },
    
    breakpoints: {
        579: {
            slidesPerView: 'auto',
            spaceBetween: 20
        },
        
    }
})


const advantagesSlider = new Swiper('.swiper.advantages-slider', {
    // Настройки для fade-эффекта
    effect: 'fade',
    fadeEffect: {
      crossFade: true // Плавное перекрытие слайдов
    },
    
    // Дополнительные параметры
    speed: 1000, // Длительность анимации перехода (в мс)    
        
    // Навигационные элементы
    navigation: {
      nextEl: '.as-slide__controls .slider-nav.slider-next',
      prevEl: '.as-slide__controls .slider-nav.slider-prev'
    },
    
    
  });


import marquee from './vanilla-marquee.min.js'

const runnerLines = document.querySelectorAll('.runner-line');
if ( runnerLines.length ){

    runnerLines.forEach( rl => {
        new marquee( rl, {
            speed: 50,
            pauseOnHover: true,
            duplicated: true,
            recalcResize: true,
        } )        
    } )

}







const tabTogglers = document.querySelectorAll('.tabs__single-tab');
const sheets = document.querySelectorAll('.sheet');


if ( tabTogglers.length && sheets.length){

    tabTogglers.forEach( (tab, index) => {
        tab.addEventListener('click', function(){

            if ( this.classList.contains('active') ) return ;

            const activeTab = document.querySelector('.tabs__single-tab.active');
            const activeSheet = document.querySelector('.sheet.active');

            activeTab.classList.remove('active');
            activeSheet.classList.remove('active');

            this.classList.add('active');
            sheets[index].classList.add('active');

            
        })
    } )
}
const { animate, createTimer, createTimeline, waapi } = anime;





const heroSection = document.querySelector('.hero');
if ( heroSection ){
    
    const heroBg = new Swiper('.swiper.hero-bg-conatiner', {
        effect: 'fade',
        fadeEffect: {
          crossFade: true 
        },       
        speed: 1000,

        
      });

      const heroMainContent = new Swiper('.swiper.hero-main-content', {
        effect: 'fade',
        fadeEffect: {
          crossFade: true 
        },       
        speed: 1000,
        allowTouchMove: false,
        mousewheel: { enabled: false },
        keyboard: { enabled: false },
        
      });

    
      
    const heroBtnTogglers = document.querySelectorAll('.hero-single-toggler');
    
    





    if ( heroBtnTogglers.length > 1 ){
        const heroTogglers = new Swiper(".swiper.hero-togglers  ", {
            speed: 1000,    
            slidesPerView: 'auto',
            spaceBetween: 0,
            breakpoints: {
                320: {
                    slidesPerView: 'auto',
                    spaceBetween: 0
                },
                580: {
                    slidesPerView: 'auto',
                    spaceBetween: 12
                },
                1400: {
                    slidesPerView: 3,
                    spaceBetween: 25
                },
            }
        })  

        const container = document.querySelector('.swiper.hero-togglers .swiper-wrapper');


        const indicators = document.querySelectorAll('.hero-single-toggler__color-indicator');
        
        



        
        var activeIndexToggler = 0;
        let potenialNextIndex = 1;

        let startTimer = 0;
        const finishTimer = 7000;
        let timerReset = false;

        createTimer({
            duration: 7000,
            loop: true,
            frameRate: 30,
            onUpdate: self => {

                if ( activeIndexToggler >= heroBtnTogglers.length - 1 ){
                    potenialNextIndex = 0;
                } else{
                    potenialNextIndex  = activeIndexToggler + 1;
                }

                //console.log(activeIndexToggler, potenialNextIndex);

                if ( timerReset ){
                    startTimer = 0;
                    self.currentTime = 0;
                    timerReset = false;
                } else{
                    startTimer = self.currentTime;
                }
                
                
                if ( self.currentTime >= finishTimer) {
                    self.currentTime = 0;
                    let currentVW = document.documentElement.clientWidth;

                    changeSlide(heroBtnTogglers[potenialNextIndex],  heroBtnTogglers[activeIndexToggler], potenialNextIndex, currentVW, heroBg, heroMainContent, container);
                }
                //console.log(self.currentTime);
                indicators.forEach( ind => {
                    ind.style.width = ((startTimer / finishTimer) * 100 ) + '%';
                } )
                
            },
            
        });

        heroBtnTogglers.forEach(  (tgl, index) => {
            if ( tgl.classList.contains('active-toggler') ) activeIndexToggler = index;


            tgl.addEventListener( 'click', function(){
                if ( tgl.classList.contains('active-toggler') || tgl.classList.contains('open-mode') ) return;
                
                let currentVW = document.documentElement.clientWidth;
                timerReset = true;

                changeSlide(this,  heroBtnTogglers[activeIndexToggler], index, currentVW, heroBg, heroMainContent, container);


                

            })

        } )
    }
      
    

    


}


function changeSlide(newActiveToggler, oldActiveToggler, newIndex, currentVW, bgSlider, contentSlider, container){
    if ( currentVW < 580 ){
        let containerHeight = container.offsetHeight + 'px';
        container.style.maxHeight = containerHeight;
        container.style.minHeight = containerHeight;

        let tglHeight = newActiveToggler.offsetHeight;
    
        const tglContent = newActiveToggler.querySelector('.hero-single-toggler__main-toggler-content');
        const tglTitleBlock = newActiveToggler.querySelector('.hero-single-toggler__title-block');
          
        let tglContentHeight = tglContent.offsetHeight;
        let tglTitleBlockHeight = tglTitleBlock.offsetHeight;

        let currentImg = newActiveToggler.querySelector('.hero-single-toggler__img-block');
        currentImg.style.minHeight = currentImg.offsetHeight + 'px';

        newActiveToggler.classList.add('open-mode');
        newActiveToggler.style.height = tglHeight + 'px';


        
        oldActiveToggler.classList.add('close-mode');

        
        

        let oldActiveTitleBlock = oldActiveToggler.querySelector('.hero-single-toggler__title-block');
        let oldTglContent = oldActiveToggler.querySelector('.hero-single-toggler__main-toggler-content');

        let oldActiveTitleBlockHeight = oldActiveTitleBlock.offsetHeight;

        let oldImg = oldActiveToggler.querySelector('.hero-single-toggler__img-block');
        oldImg.style.minHeight = oldImg.offsetHeight + 'px';


        let ooh = oldTglContent.offsetHeight + 'px';
        let toh = oldActiveTitleBlock.offsetHeight + 'px';

        
        
        animate(newActiveToggler, { 
            duration: 400,
            delay: 50,
            easing: 'linear',
            minHeight: (tglContentHeight + 'px') }
        );

        animate(tglContent, { 
            duration: 400,
            delay: 50,
            easing: 'linear',
            height: (tglContentHeight + 'px') , 
            onComplete: self =>{
                newActiveToggler.classList.remove('open-mode');
                newActiveToggler.classList.add('active-toggler');
                activeIndexToggler = newIndex;
                currentImg.setAttribute('style', "");
                newActiveToggler.setAttribute('style', "");

                
            }

        });


        animate(oldActiveToggler, { 
            duration: 400,
            easing: 'linear',
            delay: 50,
            maxHeight: {
                from: ooh, 
                to: toh
            } 
        });

        animate(oldTglContent, { 
            duration: 400,
            easing: 'linear',
            maxHeight: '0px' , 
            delay: 50,
            onComplete: self =>{
                oldActiveToggler.classList.remove('close-mode');
                oldActiveToggler.classList.remove('active-toggler');
                oldActiveToggler.setAttribute('style', "");
                oldTglContent.setAttribute('style', "");
                oldImg.setAttribute('style', "");
                
            }

        });
        setTimeout(() => {
            container.setAttribute('style', "");
        }, 450)
    }


    if ( currentVW > 580 && currentVW < 1400 ) {

        let parentContainer = container.closest('.hero-togglers');
        
        let w = (parentContainer.offsetWidth - 360 - 24);

        if ( w < 432 ){
            w = 432;
        }
        w = w + 'px';

        newActiveToggler.classList.add('active-toggler');
        
        newActiveToggler.style.maxHeight = newActiveToggler.offsetHeight + 'px';
        oldActiveToggler.style.maxHeight = newActiveToggler.offsetHeight + 'px';
        animate(oldActiveToggler, { 
            duration: 400,
            delay: 50,
            easing: 'linear',
            width: {
                from: w, 
                to: '180px'
            },
            onComplete: self =>{
                //oldActiveToggler.style.width = '';
                oldActiveToggler.classList.remove('active-toggler');
            }
        });
        animate(newActiveToggler, { 
            duration: 400,
            delay: 50,
            easing: 'linear',
            width: {
                from: '180px', 
                to: w
            },
            onComplete: self =>{
                newActiveToggler.classList.add('active-toggler');
                //newActiveToggler.style.width = '';
            }
        });
        

        
        activeIndexToggler = newIndex;
    }
    if ( currentVW >= 1400 ) {
        newActiveToggler.classList.add('active-toggler');
        oldActiveToggler.classList.remove('active-toggler');
        activeIndexToggler = newIndex;
    }
    bgSlider.slideTo(newIndex); 
    contentSlider.slideTo(newIndex); 
}