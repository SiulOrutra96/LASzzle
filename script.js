var numPiezas = 4;
var anchoImagen = 600;
var altoImagen;
var indicesAux = [];
var margenes = [];
var armado = false;

$(document).on("change", "#imagen-input", function () {
    var imagen = this.files[0];
    var formatosSoportados = ["image/jpeg", "image/png", "image/gif"];

    if (formatosSoportados.indexOf(imagen.type) > -1) {
        cargarImagen(imagen);
    } else {
        alert("El archivo no es una imagen");
    }
});

$(document).on("click", ".pieza", function () {
    if (!armado) {
        var piezas = $(".pieza");
        var blancaIndex;
        var thisIndex;
        var blancaEncontrada = false;
        var thisEncontrada = false;

        for (var i = 0; i < piezas.length; i++) {
            if (blancaEncontrada && thisEncontrada) {
                break;
            }

            if (piezas[i].id == "blanca") {
                blancaIndex = i;
                blancaEncontrada = true;
            } else if (piezas[i].id == this.id) {
                thisIndex = i;
                thisEncontrada = true;
            }
        }

        // Verifica si la pieza seleccionada es adyacente al espacio en blanco
        if (
            (Math.abs(blancaIndex - thisIndex) == 4) ||
            (Math.abs(blancaIndex - thisIndex) == 1 && Math.abs(blancaIndex % 4 - thisIndex % 4) == 1)
        ) {
            // Intercambiar las piezas de lugar
            var thisTop = this.children[0].style.marginTop;
            var thisLeft = this.children[0].style.marginLeft;
            var thisId = this.id;
            var aux;

            // Se intercabian los margenes de la imagen en cada pieza
            this.children[0].style.marginTop = piezas[blancaIndex].children[0].style.marginTop;
            this.children[0].style.marginLeft = piezas[blancaIndex].children[0].style.marginLeft;
            this.id = "blanca";

            piezas[blancaIndex].children[0].style.marginTop = thisTop;
            piezas[blancaIndex].children[0].style.marginLeft = thisLeft;
            piezas[blancaIndex].id = thisId;

            // Se intercambian los indicen en el auxiliar
            aux = indicesAux[blancaIndex];
            indicesAux[blancaIndex] = indicesAux[thisIndex];
            indicesAux[thisIndex] = aux;
        }

        var terminado = true;

        for (var i = 1; i < piezas.length; i++) {
            if (!terminado) {
                break;
            }

            if (terminado && indicesAux[i] < indicesAux[i - 1]) {
                terminado = false;
            }
        }

        if (terminado) {
            armado = true;
            piezas[thisIndex].children[0].style.marginTop = margenes[margenes.length - 1][0];
            piezas[thisIndex].children[0].style.marginLeft = margenes[margenes.length - 1][1];
            alert("¡¡¡Felicidades!!! Armaste el rompecabezas.");
        }
    }
});

function cargarImagen(file) {
    var ancho;
    var alto;
    var anchoPieza = 150;
    var altoPieza;
    var piezasFila = "";
    var htmlPieza = [];
    var piezasAux = [];
    var htmlFilas = "";

    margenes = [];

    // Generar las filas
    for (var i = 0; i < numPiezas; i++) {
        htmlFilas += "<div class='fila'></div>";
    }
    $("#rompecabezas").html(htmlFilas);

    // Poner las filas en un arreglo
    var filas = $(".fila");

    // Cargar la imagen para obtener el alto y ancho
    imagen = new Image();
    var imagenUrl = URL.createObjectURL(file);
    imagen.onload = function () {
        ancho = this.width;
        alto = this.height;

        // Calcular el alto de las piezas 
        altoImagen = (alto * anchoImagen) / ancho;
        altoPieza = altoImagen / numPiezas;

        // Crear el html para cada pieza y guardarlo en un arreglo
        for (var i = 0; i < numPiezas; i++) {
            for (var j = 0; j < numPiezas; j++) {
                htmlPieza.push(`
                    <div id="pieza` + (j + i * numPiezas) + `" class="pieza" style="width: ` + anchoPieza + `px; height: ` + altoPieza + `px">
                        <img style="margin: ` + -(i * altoPieza) + `px 0px 0px ` + -(j * anchoPieza) + `px" src="` + imagenUrl + `"/>
                    </div>
                `);

                piezasAux.push(j + i * numPiezas);

                var margen = [];
                margen.push(-(i * altoPieza));
                margen.push(-(j * anchoPieza));
                margenes.push(margen);
            }
        }

        // Agregar la pieza en blanco
        htmlPieza[htmlPieza.length - 1] = `
            <div id="blanca" class="pieza" style="width: ` + anchoPieza + `px; height: ` + altoPieza + `px">
                <img style="margin: ` + -altoImagen + `px 0px 0px ` + -anchoImagen + `px" src="` + imagenUrl + `"/>
            </div>
        `

        // Reborujar las piezas
        htmlPieza = reborujar(htmlPieza, piezasAux);

        // Colocar las piezas reborujadas
        for (var i = 0; i < numPiezas; i++) {
            for (var j = 0; j < numPiezas; j++) {
                piezasFila += htmlPieza[j + i * numPiezas];
            }

            $(filas[i]).html(piezasFila);
            piezasFila = "";
        }
        URL.revokeObjectURL(imagenUrl);
    };
    imagen.src = imagenUrl;
}

function nuevoJuego() {
    var piezas = $(".pieza");
    var blanca = $("#blanca");
    var indices = [];
    var margenesAux = [...margenes];
    
    armado = false;

    for (var i = 0; i < numPiezas; i++) {
        for (var j = 0; j < numPiezas; j++) {
            indices.push(j + i * numPiezas);
        }
    }

    blanca = piezas.filter((index, pieza) => pieza.id == "blanca")[0];

    margenesAux[margenesAux.length - 1][0] = -altoImagen;
    margenesAux[margenesAux.length - 1][1] = -anchoImagen;
    margenesAux = reborujar(margenesAux, indices);

    for (var i = 0; i < numPiezas; i++) {
        for (var j = 0; j < numPiezas; j++) {
            var index = j + i * numPiezas;
            if (margenesAux[index][0] == -altoImagen &&
                margenesAux[index][1] == -anchoImagen &&
                piezas[index].id != "blanca") {
                blanca.id = piezas[index].id
                piezas[index].id = "blanca";
            }
            piezas[index].children[0].style.marginTop = margenesAux[index][0];
            piezas[index].children[0].style.marginLeft = margenesAux[index][1];
        }
    }
}

function reborujar(arreglo, indices) {
    var arregloAux = [];
    indicesAux = [];

    while (arreglo.length > 0) {
        var index = Math.floor(Math.random() * arreglo.length);
        indicesAux.push(indices[index]);
        indices.splice(index, 1);
        arregloAux.push(arreglo[index]);
        arreglo.splice(index, 1);
    }

    // Valida si el acaomodo es resolvible y si no lo hace resolvible
    if (!validarAcomodo([...indicesAux])) {
        if (indicesAux[indicesAux.length - 1] == indicesAux.length - 1) {
            var aux = arregloAux[indicesAux.length - 2];
            arregloAux[indicesAux.length - 2] = arregloAux[indicesAux.length - 3];
            arregloAux[indicesAux.length - 3] = aux;

            var aux2 = indicesAux[indicesAux.length - 2];
            indicesAux[indicesAux.length - 2] = indicesAux[indicesAux.length - 3];
            indicesAux[indicesAux.length - 3] = aux2;
        } else if (indicesAux[indicesAux.length - 2] == indicesAux.length - 1) {
            var aux = arregloAux[indicesAux.length - 1];
            arregloAux[indicesAux.length - 1] = arregloAux[indicesAux.length - 3];
            arregloAux[indicesAux.length - 3] = aux;

            var aux2 = indicesAux[indicesAux.length - 1];
            indicesAux[indicesAux.length - 1] = indicesAux[indicesAux.length - 3];
            indicesAux[indicesAux.length - 3] = aux2;
        } else {
            var aux = arregloAux[indicesAux.length - 1];
            arregloAux[indicesAux.length - 1] = arregloAux[indicesAux.length - 2];
            arregloAux[indicesAux.length - 2] = aux;

            var aux2 = indicesAux[indicesAux.length - 1];
            indicesAux[indicesAux.length - 1] = indicesAux[indicesAux.length - 2];
            indicesAux[indicesAux.length - 2] = aux2;
        }
    }

    return arregloAux;
}

function validarAcomodo(arreglo) {
    var blancoPar;
    var inversiones = 0;
    var blancaIndex = arreglo.length - 1;
    while (arreglo.length > 0) {
        actual = arreglo[arreglo.length - 1];
        if (actual != blancaIndex) {
            for (var i = 0; i < arreglo.length - 1; i++) {
                if (arreglo[i] != blancaIndex && arreglo[i] > actual) {
                    inversiones++;
                }
            }
        } else {
            blancoPar = (Math.floor((arreglo.length - 1) / numPiezas) - numPiezas) % 2 == 0;
        }
        arreglo.pop();
    }

    return (numPiezas % 2 != 0 && inversiones % 2 == 0) || (numPiezas % 2 == 0 && (blancoPar == (inversiones % 2 != 0)));
}