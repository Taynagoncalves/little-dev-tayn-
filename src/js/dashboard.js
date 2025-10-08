const itensMenu = document.querySelectorAll('.menu li');

itensMenu.forEach(item => {
  item.addEventListener('click', () => {
 
    itensMenu.forEach(i => i.classList.remove('ativo'));
   
    item.classList.add('ativo');
  });
});

