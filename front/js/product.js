//------Recuperer l'id dans l'url
function getProductId () {
// Recuperation de l'url de la page
let url = new URL(window.location.href);
// Recuperation de tout les parametres de l'url
let params = new URLSearchParams(url.search);

    //---Recuperation du parametre ID
    // si l'id est present dans l'url
    if (params.has('id')) {
        let id = params.get('id');
        return id;
    }
    // si l'id est absent de l'url
    else {
        console.log("Erreur : l'identifiant n'est pas present dans l'url");
        alert("Erreur : l'identifiant n'est pas present dans l'url");
    }
}


//------Retourner les caracteristiques du produit de l'API
async function getProductData () {
    const productId = getProductId ();
    try {
        let response = await fetch(`http://localhost:3000/api/products/${productId}`);
        // convertion de la reponse au format json    
        return await response.json();
        }
    catch (e) {
        console.log("Erreur lors de l'appel du serveur " + e);
        alert("Erreur lors de l'appel du serveur " );
    }
};

//-------------------------------------------------------------//
//-------------------AFFICHAGE DES PRODUITS-------------------//

//------Afficher le produit
(async function displayProducts() {
    let data = await getProductData ();
    document.getElementById('title').textContent = data.name;
    document.getElementById('price').textContent = data.price;
    document.getElementById('description').textContent = data.description;
    //---ajouter image 
    document.querySelector('.item__img').innerHTML = `
        <img src="${data.imageUrl}" alt="${data.altTxt}">
    `;
    //---choix des couleurs
    let colors = data.colors;
    
    // creation d'un rendu
    let colorRender = '';
    colors.forEach(item => {
        let htmlContentItem = `
            <option value="${item}">${item}</option>
        `;
        // stocker le rendu en memoire
        colorRender = colorRender+htmlContentItem;
    });
    // injection du rendu dans l'html 
    document.getElementById('colors').innerHTML = colorRender;
})();

//-------------------FIN afichage des produits-------------//
//--------------------------------------------------------//
//-------------------GESTION DU PANIER-------------------//

//------Modele d'objet pour les produits selectionnes
class product {
    constructor(productId,color, quantity, price, name, description, image, altTxt){
        this.productId = productId,
        this.color = color,
        this.quantity = quantity,
        this.price = price,
        this.name = name,
        this.description = description,
        this.image = image,
        this.altTxt = altTxt
    }
};

//---------Recuperation du choix de l'utilisateur---------//
(async function userSelection(){
    // recuperation du produit selectionne (api)
    let productData =  await getProductData();

    // selection du boutton AddToCart
    const button = document.querySelector("#addToCart");
    // selection du formulaire Colors
    const selectedColor = document.querySelector("#colors");
    // selection de l'input Quantity
    const selectedQuantity = document.querySelector("#quantity");

    //------Ecouter le bouton AjouterAuPanier
    // ajouter un evenement
    button.addEventListener("click", (event) => {
        // bloquer les evenements par defaut
        event.preventDefault();

        //---Creation de l'objet de recuperation de la saisie de l'utilisateur
        let selection = new product(
            productData._id,
            selectedColor.value,
            Number(selectedQuantity.value), 
            productData.price,
            productData.name,
            productData.description,
            productData.imageUrl,
            productData.altTxt
            );
            
        // si la quantite enregistree est comprise entre 1 et 100
        if (selection.quantity >= 1 && selection.quantity <= 100) {
            //---Envoyer dans le panier (local storage)
            // recuperer les donnes du panier
            let cart = JSON.parse(localStorage.getItem("panier"));
    
            // si le panier n'existe pas
            if (cart == null) {
                // on cree le panier pour envoyer directement
                let cart = [selection];
                localStorage.setItem("panier", JSON.stringify(cart));

            // tester si il y a un doublon dans le tableau
            } else if (cart.some(y =>
                y.id === selection.id &&
                y.color === selection.color) == true) {
                    // on prend son index
                    const duplicateIndex = cart.findIndex(e =>
                        e.id === selection.id &&
                        e.color === selection.color);
                    // addition de la valeur initiale du panier avec la selection
                    cart[duplicateIndex].quantity = cart[duplicateIndex].quantity + selection.quantity;
                    // mise a jour du panier
                    localStorage.setItem("panier", JSON.stringify(cart));

            // si l'element n'est pas dans un panier
            } else {
                // envoyer directement la selection au panier
                cart.push(selection);
                localStorage.setItem("panier", JSON.stringify(cart));
            };
            alert(`${selection.quantity} article(s) ${selection.color} ajoute(s) dans le panier`);

        // si la quantite enregistree n'est pas comprise entre 1 et 100
        } else {
            // Message erreur
            alert("Veuillez indiquer une quantite entre 1 et 100");
        }

        
    });
})();
