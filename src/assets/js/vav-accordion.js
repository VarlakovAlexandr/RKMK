class VavAccordion {

    accordions = null;
    
    constructor(selector, settings = {singleMode: true, closeChilds: true}) {
        let accordions = document.querySelectorAll(selector);        
        if ( accordions.length ) {
            let { singleMode, closeChilds } = settings;
            
            if ( singleMode === undefined ) singleMode = false;
            if ( closeChilds === undefined ) closeChilds = false;

            this.accordions = accordions  

            this.accordions.forEach(accordion => {
                
                const headers = accordion.querySelectorAll(':scope > .vav-accordion-item >.vav-accordion-header');

                const closeItem = function( item ){
                    const itemBody = item.querySelector('.vav-accordion-body');
                    const itemContent = item.querySelector('.vav-accordion-content');

                    let contentHeight = itemContent.offsetHeight + 'px';
                    
                    itemBody.style.maxHeight = contentHeight;
                    itemBody.style.height = contentHeight;
                    
                    const closingFunction = () => {                                    
                        item.classList.remove('closing');
                        item.classList.remove('open');

                        itemBody.style.maxHeight = "";
                        itemBody.style.height = "";

                        if ( closeChilds ) {
                            let childAccordions = item.querySelectorAll('.vav-accordion');
                            console.log(childAccordions);
                            if ( childAccordions.length ){
                                childAccordions.forEach( childAccordion => {
                                    let openChildItems = childAccordion.querySelectorAll('.vav-accordion-item.open');

                                    if (openChildItems.length ){
                                        openChildItems.forEach( childItem=> {
                                            childItem.classList.remove('open')
                                        } )
                                    }
                                } )
                                
                            }

                        }
                        
                        itemBody.removeEventListener('transitionend', closingFunction);
                    }

                    setTimeout(() => {
                        itemBody.style.maxHeight = '0px';
                        itemBody.style.height = '0px';
                        itemBody.addEventListener('transitionend', closingFunction)
                        item.classList.add('closing');    
                    }, 10);
                    
                }

                const openItem = function( item ){

                    if ( singleMode ){
                        const parentContainer = item.closest('.vav-accordion');
                        let activeItem = parentContainer.querySelector(':scope > .vav-accordion-item.open');
                        if ( activeItem ){
                            closeItem(activeItem);
                        }
                    }

                    const itemBody = item.querySelector('.vav-accordion-body');
                    const itemContent = item.querySelector('.vav-accordion-content');

                    item.classList.add('opening');

                    const openingFunction = () => {
                        
                        item.classList.add('open')
                        item.classList.remove('opening');
                        itemBody.style.minHeight = '';
                        itemBody.removeEventListener('transitionend', openingFunction);
                    }

                    itemBody.addEventListener('transitionend', openingFunction);
                    
                    let contentHeight = itemContent.offsetHeight + 'px';
                    itemBody.style.minHeight = contentHeight;
                }

                if ( headers.length ){
                    headers.forEach( header => {

                        header.addEventListener('click', function( event ){
                            const item = this.closest('.vav-accordion-item');

                            if ( item.classList.contains('opening') ||  item.classList.contains('closing') ) return false;
                            
                            if ( !item.classList.contains('open') ){                               
                                openItem(item);
                            } else {
                                closeItem(item);
                            }

                        })



                    } )
                }


            });


        } else {
            return
        }        
    }
}


