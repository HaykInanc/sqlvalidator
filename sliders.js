const sliders = document.querySelectorAll('.tableListHeader');
sliders.forEach(s=>s.addEventListener('click',()=>s.parentElement.classList.toggle('hide')));