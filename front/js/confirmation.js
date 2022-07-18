//------Recuperer le numero de commande dans l'url
function urlOrderId() {
    // recuperation de l'url de la page
    let url = new URL(window.location.href);

    // Recuperation de tout les parametres de l'url
    let params = new URLSearchParams(url.search);
    // Recuperation du parametre ORDERV
    // si l'order est present dans l'url
    if (params.has('order')) {
        let order = params.get('order');
        return order;
    }
    // si l'order est absent de l'url
    else {
        console.log("Erreur : l'identifiant de la commande n'est pas present dans l'url");
        alert("Erreur : l'identifiant de la commande n'est pas present dans l'url");
    }
}

//------Afficher le numero de commande
(function displayOrder() {
    let order = urlOrderId();
    
    // injection dans l'html
    document.getElementById('orderId').textContent = `${order}`;
    
    // Suppression des donnees du local storage
    localStorage.clear();
})()