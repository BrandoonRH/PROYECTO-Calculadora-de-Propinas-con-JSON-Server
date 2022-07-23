let cliente = {
    table: '', 
    hour: '',
    pedidos: []
}

const categories = {
    1: 'Comida', 
    2: 'Bebidas', 
    3: 'Postres'
}

const btnSaveCustomer = document.querySelector('#guardar-cliente');
btnSaveCustomer.addEventListener('click', saveCustomer ); 

function saveCustomer(){
    const table = document.querySelector('#mesa').value;
    const hour = document.querySelector('#hora').value;

    const inputsEmpty = [table, hour].some( campo => campo === ''); 

    if(inputsEmpty){
        const existAlert = document.querySelector('.invalid-feedback'); 
        if(!existAlert){
            const alert = document.createElement('DIV');
            alert.classList.add('invalid-feedback', 'd-block', 'text-center'); 
            alert.textContent = 'Todos los Campos son Obligatorios';
            document.querySelector('.modal-body form').appendChild(alert);
            setTimeout(() => {
                alert.remove(); 
            }, 2000);
        }
        return; 
    }

    //Asignar datos del formulario al objeto de cliente 
    cliente = {...cliente, table, hour}
    
    //Ocultar Modal 
    const modalForm = document.querySelector('#formulario'); 
    const modalBootstrap = bootstrap.Modal.getInstance(modalForm);
    modalBootstrap.hide(); 

    //Mostrar secciones 
    showSections(); 
    //Obtener Plantillos de la API de JSON server
    getMenu(); 
}



function showSections(){
const sectionsHidden = document.querySelectorAll('.d-none');
sectionsHidden.forEach( section => section.classList.remove('d-none') ); 
}

function getMenu(){
    const url = 'http://localhost:3000/platillos';
    fetch(url)
    .then( response => response.json() )
    .then( result => showPlates(result) )
    .catch(error => console.log(error) )
}

function showPlates(plates){
  const contenido = document.querySelector('#platillos .contenido');
  plates.forEach(plate => {
     const row = document.createElement('DIV'); 
     row.classList.add('row', 'py-3', 'border-top'); 

     const name = document.createElement('DIV'); 
     name.classList.add('col-md-4'); 
     name.textContent = plate.nombre; 

     const price = document.createElement('DIV');
     price.classList.add('col-md-3', 'fw-bold');
     price.textContent = `$${plate.precio}`;

     const category = document.createElement('DIV'); 
     category.classList.add('col-md-3');
     category.textContent = categories[plate.categoria]; 

     const inputAmount = document.createElement('INPUT');
     inputAmount.type = 'number'; 
     inputAmount.min = 0; 
     inputAmount.value = 0; 
     inputAmount.id = `product-${plate.id}`;
     inputAmount.classList.add('form-control');
     //Function plate and amount 
     inputAmount.onchange = function(){
        const amount = parseInt(inputAmount.value);
      
        addPlate({...plate, amount});

     }

     const add = document.createElement('DIV');
     add.classList.add('col-md-2');

     add.appendChild(inputAmount);
    
     row.appendChild(name); 
     row.appendChild(price); 
     row.appendChild(category); 
     row.appendChild(add); 
     contenido.appendChild(row); 
  });
}

function addPlate(product){
    let { pedidos } = cliente;
    //Check that the amount is greater than zero
    if(product.amount > 0){

        //Comprobar si el elemento ya existe en el array 
        if(pedidos.some(element => element.id === product.id)){
           //Actualizar la cantidad 
           const orderUpdate = pedidos.map(element => {

            if ( element.id === product.id ) {
                element.amount = product.amount
            } 
            return element; 
           }); 

           cliente.pedidos = [...orderUpdate]; 
        }else{
            cliente.pedidos = [...pedidos, product]
        }
       
    }else{
       //Eliminar elementos cuando la cantidad es cero 
       const result = pedidos.filter(element => element.id !== product.id); 
       cliente.pedidos = [...result];
    }

    //Eliminar contenido previo de HTML 
    cleanHTML(); 
    if( cliente.pedidos.length ){
        //Mostrar Resumen;
        updateSummary();  
    }else{
        messageOrderEmpty();
    }

   
}

function updateSummary(){
   const content = document.querySelector('#resumen .contenido'); 

   const summary = document.createElement('DIV'); 
   summary.classList.add('col-md-6', 'card', 'py-3', 'px-3', 'shadow');

   //Info table 
   const table = document.createElement('P'); 
   table.textContent = 'Mesa: '; 
   table.classList.add('fw-bold');

   const tableSpan = document.createElement('SPAN'); 
   tableSpan.textContent = cliente.table;
   tableSpan.classList.add('fw-normal'); 

   //Info Hour
   const hour = document.createElement('P'); 
   hour.textContent = 'Hora: '; 
   hour.classList.add('fw-bold');

   const hourSpan = document.createElement('SPAN'); 
   hourSpan.textContent = cliente.hour;
   hourSpan.classList.add('fw-normal'); 

   table.appendChild(tableSpan); 
   hour.appendChild(hourSpan); 

   //Section Title 
   const heading = document.createElement('H3'); 
   heading.textContent = 'Platillos Consumidos';
   heading.classList.add('my-4', 'text-center');

   //Iterar y mostrar array de pedidos 
   const group = document.createElement('UL'); 
   group.classList.add('list-group');

   const { pedidos } = cliente; 
   pedidos.forEach(pedido => {
    const { nombre, amount, precio, id} = pedido;
    const list = document.createElement('LI'); 
    list.classList.add('list-group-item');

    const nameLI = document.createElement('H4'); 
    nameLI.classList.add('my-4'); 
    nameLI.textContent = nombre;

    const amountLI = document.createElement('P'); 
    amountLI.classList.add('fw-bold'); 
    amountLI.textContent = 'Cantidad: ';
    const amountValue = document.createElement('SPAN'); 
    amountValue.classList.add('fw-normal');
    amountValue.textContent = amount;

    const priceLI = document.createElement('P'); 
    priceLI.classList.add('fw-bold'); 
    priceLI.textContent = 'Precio: ';
    const priceValue = document.createElement('SPAN'); 
    priceValue.classList.add('fw-normal');
    priceValue.textContent = `$${precio}`;

    //Subtotal del Articulo 
    const subtotalLI = document.createElement('P'); 
    subtotalLI.classList.add('fw-bold'); 
    subtotalLI.textContent = 'Subtotal: ';
    const subtotalValue = document.createElement('SPAN'); 
    subtotalValue.classList.add('fw-normal');
    subtotalValue.textContent = `$${precio * amount}`;

    //Boton de eliminar 
    const btnDelete = document.createElement('BUTTON'); 
    btnDelete.classList.add('btn', 'btn-danger'); 
    btnDelete.textContent = 'Eliminar'

    //Funcion delete
    btnDelete.onclick = function (){
        Swal.fire({
            title: '¿Estas Seguro?',
            text: "Esto Eliminara el Pedido del Cliente",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'No',
            confirmButtonText: 'Si, eliminar'
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire('Eliminado','El Pedido se a Eliminado.','success')
            }
           deleteProduct(id);
          })
    }

    //Agregar valores a sus containers
    amountLI.appendChild(amountValue);
    priceLI.appendChild(priceValue);
    subtotalLI.appendChild(subtotalValue);
    
    //Agregar elemntos al LI 
    list.appendChild(nameLI);
    list.appendChild(amountLI); 
    list.appendChild(priceLI); 
    list.appendChild(subtotalLI); 
    list.appendChild(btnDelete); 
    //Agregar lista al UL
    group.appendChild(list);
   });

   summary.appendChild(heading); 
   summary.appendChild(table); 
   summary.appendChild(hour); 
   summary.appendChild(group); 

   content.appendChild(summary); 

   //Fostrar formulario de propinas 
   showFormTips(); 
}

function cleanHTML(){
    const content = document.querySelector('#resumen .contenido'); 
    while(content.firstChild){
       content.removeChild(content.firstChild)
    }
}

function deleteProduct(id){
    const {pedidos} = cliente;
      //Eliminar elementos cuando la cantidad es cero 
      const result = pedidos.filter(element => element.id !== id); 
      cliente.pedidos = [...result];
        //Eliminar contenido previo de HTML 
        cleanHTML(); 
        if( cliente.pedidos.length ){
            //Mostrar Resumen;
            updateSummary();  
        }else{
            messageOrderEmpty();
        }
    //Regresar su input de cantidad a cero     
    const productDelete = `#product-${id}`;
    const inputProductDelete = document.querySelector(productDelete);
    inputProductDelete.value = 0;
}

function messageOrderEmpty(){
   const container = document.querySelector('#resumen .contenido');
   const text = document.createElement('P'); 
   text.classList.add('text-center'); 
   text.textContent = 'Añade los Elementos del Pedido'; 
   container.appendChild(text); 
}

function showFormTips(){
   const container = document.querySelector('#resumen .contenido'); 

   const form = document.createElement('DIV'); 
   form.classList.add('col-md-6', 'formulario', );
   
   const divForm = document.createElement('DIV'); 
   divForm.classList.add('card', 'py-3', 'px-3', 'shadow')

   const heading = document.createElement('H3'); 
   heading.classList.add('my-4', 'text-center'); 
   heading.textContent = 'Propinas';

   //Radios Buttons
   //10%
   const radioTen = document.createElement('INPUT');
   radioTen.type = 'radio'; 
   radioTen.name = 'propina'; 
   radioTen.value = "10"; 
   radioTen.classList.add('form-check-input'); 
   radioTen.onclick = calculateTip; 

   const radioTenLabel = document.createElement('LABEL'); 
   radioTenLabel.textContent = '10%'; 
   radioTenLabel.classList.add('form-check-label');

   const divRadioTen = document.createElement('DIV'); 
   divRadioTen.classList.add('form-check'); 

   divRadioTen.appendChild(radioTen); 
   divRadioTen.appendChild(radioTenLabel); 

   //25%
   const radiotwentyfive = document.createElement('INPUT');
   radiotwentyfive.type = 'radio'; 
   radiotwentyfive.name = 'propina'; 
   radiotwentyfive.value = "25"; 
   radiotwentyfive.classList.add('form-check-input'); 
   radiotwentyfive.onclick = calculateTip; 

   const radiotwentyfiveLabel = document.createElement('LABEL'); 
   radiotwentyfiveLabel.textContent = '25%'; 
   radiotwentyfiveLabel.classList.add('form-check-label');

   const divRadiotwentyfive = document.createElement('DIV'); 
   divRadiotwentyfive.classList.add('form-check'); 

   divRadiotwentyfive.appendChild(radiotwentyfive); 
   divRadiotwentyfive.appendChild(radiotwentyfiveLabel); 

     //50%
     const radioFifty = document.createElement('INPUT');
     radioFifty.type = 'radio'; 
     radioFifty.name = 'propina'; 
     radioFifty.value = "50"; 
     radioFifty.classList.add('form-check-input'); 
     radioFifty.onclick = calculateTip; 
  
     const radioFiftyLabel = document.createElement('LABEL'); 
     radioFiftyLabel.textContent = '50%'; 
     radioFiftyLabel.classList.add('form-check-label');
  
     const divRadioFifty = document.createElement('DIV'); 
     divRadioFifty.classList.add('form-check'); 
  
     divRadioFifty.appendChild(radioFifty); 
     divRadioFifty.appendChild(radioFiftyLabel); 

   divForm.appendChild(heading); 
   divForm.appendChild(divRadioTen); 
   divForm.appendChild(divRadiotwentyfive); 
   divForm.appendChild(divRadioFifty); 
   form.appendChild(divForm);
   container.appendChild(form); 

}

function calculateTip(){
    const { pedidos } = cliente;
    let subtotal = 0;
    
    pedidos.forEach(product => {
        subtotal += product.amount * product.precio;
    });
    
    const tipsSelect = document.querySelector('[name="propina"]:checked').value;
    const tip = ((subtotal*parseInt(tipsSelect)) / 100); 
    const total = subtotal + tip;
   showTotalHTML(subtotal, tip, total); 
}

function showTotalHTML(subtotal, tip, total){
   const divTotals = document.createElement('DIV'); 
   divTotals.classList.add('total-pagar', 'my-4'); 

   //Subtotal
   const subtotalParagraph = document.createElement('P'); 
   subtotalParagraph.classList.add('fs-3', 'fw-bold', 'mt-2'); 
   subtotalParagraph.textContent = 'Subtotal Consumo:  '; 
   const subtotalSpan = document.createElement('SPAN'); 
   subtotalSpan.classList.add('fw-normal');
   subtotalSpan.textContent = `$${subtotal}`; 
   subtotalParagraph.appendChild(subtotalSpan);

    //Tip
    const tipParagraph = document.createElement('P'); 
    tipParagraph.classList.add('fs-3', 'fw-bold', 'mt-2'); 
    tipParagraph.textContent = 'Propina:  '; 
    const tipSpan = document.createElement('SPAN'); 
    tipSpan.classList.add('fw-normal');
    tipSpan.textContent = `$${tip}`; 
    tipParagraph.appendChild(tipSpan);

     //total
     const totalParagraph = document.createElement('P'); 
     totalParagraph.classList.add('fs-3', 'fw-bold', 'mt-2'); 
     totalParagraph.textContent = 'Total:  '; 
     const totalSpan = document.createElement('SPAN'); 
     totalSpan.classList.add('fw-normal');
     totalSpan.textContent = `$${total}`; 
     totalParagraph.appendChild(totalSpan);

   const totalPayDiv = document.querySelector('.total-pagar'); 
   if (totalPayDiv) {
    totalPayDiv.remove(); 
   }

   divTotals.appendChild(subtotalParagraph); 
   divTotals.appendChild(tipParagraph); 
   divTotals.appendChild(totalParagraph); 

   const form = document.querySelector('.formulario > div'); 
   form.appendChild(divTotals); 
}