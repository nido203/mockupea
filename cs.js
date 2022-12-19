const storageType = localStorage;
const consentPropertyName = 'mockupea_consent';

const shouldShowPopup = () => !storageType.getItem(consentPropertyName);
const saveToStorage = () => storageType.setItem(consentPropertyName, true);

window.onload = () => {

    const consentPopup = document.getElementById("consent-popup");
    const acceptBtn = document.getElementById("accept");

    if (shouldShowPopup(storageType)){
        consentPopup.classList.remove('hidden');
    }

    const acceptFn = event => {
        saveToStorage(storageType);
        consentPopup.classList.add('hidden');
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
    
        gtag('config', 'UA-187937344-1');
        window['ga-disable-UA-187937344-1'] = false;
    };

    acceptBtn.addEventListener('click', acceptFn);
}