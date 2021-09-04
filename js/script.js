document.addEventListener("DOMContentLoaded", () => {
    // TABS
    const tabs = document.querySelectorAll(".tabheader__item"),
        parentTab = document.querySelector(".tabheader__items"),
        contents = document.querySelectorAll(".tabcontent");

    function hideContent() {
        contents.forEach((item) => (item.style.display = "none"));
        tabs.forEach((item) => {
            item.classList.remove("tabheader__item_active");
        });
    }

    function showContent(i = 0) {
        contents[i].style.display = "block";
        tabs[i].classList.add("tabheader__item_active");
    }

    hideContent();
    showContent();

    parentTab.addEventListener("click", (event) => {
        const target = event.target;

        if (target && target.classList.contains("tabheader__item")) {
            tabs.forEach((item, index) => {
                if (item == target) {
                    hideContent();
                    showContent(index);
                }
            });
        }
    });


    // TIMER
    const deadline = '2021-12-01';

    function calcEndTime(endtime) {
        let times = Date.parse(endtime) - Date.parse(new Date());
        let days = Math.floor(times / (1000 * 60 * 60 * 24));
        let hours = Math.floor((times / (1000 * 60 * 60)) % 24);
        let minites = Math.floor((times / (1000 * 60)) % 60);
        let seconds = Math.floor((times / (1000)) % 60);

        return {
            'total': times,
            days,
            hours,
            minites,
            seconds,
        };
    }

    function checkNum(num) {
        if (num >= 0 && num < 10) {
            return `0${num}`;
        } else {
            return num;
        }

    }

    function setTimer(selector, endtime) {
        const timer = document.querySelector(selector),
            days = timer.querySelector('#days'),
            hours = timer.querySelector('#hours'),
            minutes = timer.querySelector('#minutes'),
            seconds = timer.querySelector('#seconds'),
            timeInterval = setInterval(updateTimer, 1000);


        function updateTimer() {
            let times = calcEndTime(endtime);
            days.innerHTML = checkNum(times.days);
            hours.innerHTML = checkNum(times.hours);
            minutes.innerHTML = checkNum(times.minites);
            seconds.innerHTML = checkNum(times.seconds);
            if (times.total <= 0) {
                clearInterval(timeInterval);
            }
        }

    }
    setTimer('.timer', deadline);

    //   Modal

    const btns = document.querySelectorAll('[data-modal]'),
        modal = document.querySelector('.modal');


    function showModal() {
        modal.classList.add('show');
        modal.classList.remove('hide');
        document.body.style.overflow = 'hidden';
        clearInterval(modalTimer);
    }

    function close() {
        modal.classList.add('hide');
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    btns.forEach(item => {
        item.addEventListener('click', showModal);
    });



    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.getAttribute('data-close') == '') {
            close();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Escape' && modal.classList.contains('show')) {
            close();
        }
    });

    const modalTimer = setTimeout(showModal, 50000);

    function showModalByScroll() {
        if (window.pageYOffset + document.documentElement.clientHeight >= document.documentElement.scrollHeight) {
            showModal();
            window.removeEventListener('scroll', showModalByScroll);
        }
    }
    window.addEventListener('scroll', showModalByScroll);



    // Menu item

    class MenuCard {
        constructor(img, alt, subtitle, description, price, parent) {
            this.img = img;
            this.alt = alt;
            this.subtitle = subtitle;
            this.description = description;
            this.price = price;
            this.exchangesRate = 27;
            this.parent = document.querySelector(parent);
            this.changeToUA();
        }

        changeToUA() {
            this.price = this.price * this.exchangesRate;
        }

        render() {
            this.parent.insertAdjacentHTML('beforeend', `<div class="menu__item">
        <img src=${this.img} alt=${this.alt}>
        <h3 class="menu__item-subtitle">Меню ${this.subtitle}</h3>
        <div class="menu__item-descr">${this.description}</div>
        <div class="menu__item-divider"></div>
        <div class="menu__item-price">
            <div class="menu__item-cost">Цена:</div>
            <div class="menu__item-total"><span>${this.price}</span> грн/день</div>
        </div>
    </div>`);

        }
    }

  
    async function getMenuItems(url){
        let response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Could not fetch ${url}, status: ${res.status}`);
        }
       return await response.json();
    }

    getMenuItems('http://localhost:3000/menu')
    .then(data=>{
        data.forEach(({img, altimg, title, descr, price})=>{
            new MenuCard(img, altimg, title, descr, price,".menu .container").render();
    });
    
    });
     

    // Work with server

    const forms = document.querySelectorAll('form');

    let messages = {
        loading: 'img/form/spinner.svg',
        success: 'Спасибо! Скоро мы с вами свяжемся',
        failure: 'Что-то пошло не так...',
    }

    let postData= async(url, type, object) => {
        let res= await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': type
        },
            body: object
    });
    if (!res.ok) {
        throw new Error(`Could not fetch ${url}, status: ${res.status}`);
    }

    return res.json();
    };

    forms.forEach(form => bindPostData(form));

    function bindPostData(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let statusMessage = document.createElement('img');
            statusMessage.src = messages.loading;
            statusMessage.style.cssText = `
                display: block;
                margin: 0 auto;
            `;
            form.insertAdjacentElement('afterend', statusMessage);

            let formData = new FormData(form);
            const json = JSON.stringify(Object.fromEntries(formData.entries()));

            postData('http://localhost:3000/requests', 'application/json', json)
                .then(data => {
                    console.log(data);
                    showModalText(messages.success);
                    statusMessage.remove();
                }).catch(() => {
                    showModalText(messages.failure);
                }).finally(() => {
                    form.reset();
                });
        });

    }

    function showModalText(message) {
        const prevModal = document.querySelector('.modal__dialog');
        prevModal.classList.add('hide');

        showModal();

        const newModallMessage = document.createElement('div');
        newModallMessage.classList.add('modal__dialog');
        newModallMessage.innerHTML = ` 
        <div class="modal__content">
            <div data-close class="modal__close">×</div>
            <div class="modal__title">${message}</div> 
        </div>`;
        document.querySelector('.modal').append(newModallMessage);
        setTimeout(() => {
            newModallMessage.remove();
            prevModal.classList.add('show');
            prevModal.classList.remove('hide');
            close();
        }, 3000);

    }
  
// Slider

    const sliders=document.querySelectorAll('.offer__slide'),
    prevArrow=document.querySelector('.offer__slider-prev'),
    nextArrow=document.querySelector('.offer__slider-next'),
    total = document.querySelector('#total'),
    current = document.querySelector('#current'),
    sliderWrapper=document.querySelector('.offer__slider-wrapper'),
    sliderInner=document.querySelector('.offer__slider-inner'),
    sliderBlock=document.querySelector('.offer__slider');

    let sliderIndex=1;
    let offSet=0;

  
    if (sliders.length < 10) {
                    total.textContent = `0${sliders.length}`;
    } else {
                    total.textContent = sliders.length;
    }
            

    let width=window.getComputedStyle(sliderWrapper).width;
    sliders.forEach(item=> item.style.width=width);
    sliderInner.style.width=100*sliders.length+'%';
    sliderInner.style.display='flex';
    sliderInner.style.transition = '0.5s all';
    sliderWrapper.style.overflow = 'hidden';

    nextArrow.addEventListener('click', ()=>{
        if(offSet==+width.slice(0, width.length-2)*(sliders.length-1)) {
            offSet=0;
        } else {
            offSet+=+width.slice(0, width.length - 2); 
        }
        sliderInner.style.transform = `translateX(-${offSet}px)`;
       
        if (sliderIndex == sliders.length) {
            sliderIndex = 1;
        } else {
            sliderIndex++;
        }

        if (sliders.length < 10) {
            current.textContent =  `0${sliderIndex}`;
        } else {
            current.textContent =  sliderIndex;
        }
        
    })

    prevArrow.addEventListener('click', ()=>{
        if(offSet===0) {
            offSet=+width.slice(0, width.length-2)*(sliders.length-1)
        } else {
            offSet-=+width.slice(0, width.length - 2); 
        }
        sliderInner.style.transform = `translateX(-${offSet}px)`;
        if (sliderIndex == 1) {
            sliderIndex = sliders.length;
        } else {
            sliderIndex--;
        }

        if (sliders.length < 10) {
            current.textContent =  `0${sliderIndex}`;
        } else {
            current.textContent =  sliderIndex;
        }
    });

    
    
   

//     showSlides(sliderIndex);

//     if (sliders.length<10) {
//         if (sliders.length < 10) {
//             total.textContent = `0${sliders.length}`;
//         } else {
//             total.textContent = sliders.length;
//         }
//     }

//     function showSlides(n){
//         if(n>sliders.length){
//             sliderIndex=1;
//         } else if (n<1){
//             sliderIndex=sliders.length; 
//         }
//         sliders.forEach(item=>item.style.display='none');
//         sliders[sliderIndex-1].style.display='block';

//         if (sliders.length < 10) {
//             current.textContent =  `0${sliderIndex}`;
//         } else {
//             current.textContent =  sliderIndex;
//         }
//     }

//     function plusSlides (n) {
//         showSlides(sliderIndex += n);
// }

//     prevArrow.addEventListener('click', function(){
//         plusSlides(-1);
//     });

//     nextArrow.addEventListener('click', function(){
//         plusSlides(1);
//     });

});