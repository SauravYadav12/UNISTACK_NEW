var search_table = document.querySelector("#search_table");

search_table.addEventListener('keyup', (e)=>{
  let search_item = e.target.value.toLowerCase();
  let table_data = document.querySelectorAll('.table-body tr');

  table_data.forEach((items)=>{
    if(items.textContent.toLowerCase().indexOf(search_item) != -1){
      items.style.display = '' ;
    } else {
      items.style.display = 'none';
    }
  })
});