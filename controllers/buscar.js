const { request, response } = require("express");
const { ObjectId } = require('mongoose').Types;
const { Usuario, Categoria, Producto } = require('../models');

const coleccionesPermitidas = [
    'usuarios',
    'categorias',
    'productos',
    'roles'
];

const buscarUsuarios = async( termino = '', res = response) => {

    const esMongoID = ObjectId.isValid( termino ); // TRUE

    // Buscamos por ID
    if ( esMongoID ) {
        const usuario = await Usuario.findById(termino);
        return res.json({
            results: ( usuario ) ? [ usuario ] : []
        })
    }

    //Buscamos por nombre
    const regex = new RegExp( termino, 'i' ); // Hacemos una expresión regular pero le decimos que sea insencible a mayúsculas y minúsculas 

    const usuarios = await Usuario.find({ 
        $or: [ {nombre: regex}, {correo: regex} ],
        $and: [ {estado: true} ],
     });

    res.json({
        results: usuarios
    })

    // const usuarios = await Usuario.count({ 
    //     $or: [ {nombre: regex}, {correo: regex} ],
    //     $and: [ {estado: true} ],
    //  });
    // res.json({
    //     results: usuarios
    // })
}

const buscarCategorias = async( termino = '', res = response) => {

    //Buscamos por ID
    const esMongoID = ObjectId.isValid( termino ); // TRUE

    if ( esMongoID ) {
        const categoria = await Categoria.findById(termino);
        return res.json({
            results: ( categoria ) ? [ categoria ] : []
        })
    }

    // Buscamos por nombre
    const regex = new RegExp( termino, 'i' ); // Hacemos una expresión regular pero le decimos que sea insencible a mayúsculas y minúsculas 

    const categorias = await Categoria.find({ nombre: regex, estado: true });

    // const categorias = await Categoria.find({ 
    //     $or: [ {nombre: regex} ],
    //     $and: [ {estado: true} ],
    //  });

    res.json({
        results: categorias
    })

    // const usuarios = await Usuario.count({ 
    //     $or: [ {nombre: regex}, {correo: regex} ],
    //     $and: [ {estado: true} ],
    //  });
    // res.json({
    //     results: usuarios
    // })
}

const buscarProductos = async( termino = '', res = response) => {

    //Buscamos por ID
    const esMongoID = ObjectId.isValid( termino ); // TRUE

    if ( esMongoID ) {
        const producto = await Producto.findById(termino);
        return res.json({
            results: ( producto ) ? [ producto ] : []
        })
    } else if (!isNaN(termino)) {  // Buscamos por precio
        const productos = await Producto.find({ precio: termino });
        return res.json({
            results: productos
        })
    }

    // Buscamos por nombre
    const regex = new RegExp( termino, 'i' ); // Hacemos una expresión regular pero le decimos que sea insencible a mayúsculas y minúsculas 

    const productos = await Producto.find({ 
        $or: [ {nombre: regex} ],
        $and: [ {estado: true} ],
     })
     .populate('categoria', 'nombre')
     .populate('usuario', 'nombre');

    res.json({
        results: productos
    })

    // const usuarios = await Usuario.count({ 
    //     $or: [ {nombre: regex}, {correo: regex} ],
    //     $and: [ {estado: true} ],
    //  });
    // res.json({
    //     results: usuarios
    // })
}


const buscar = (req = request, res = response) => {
    
    const { coleccion, termino } = req.params;

    if ( !coleccionesPermitidas.includes(coleccion) ) {
        return res.status(400).json({
            msg: `Las colecciones permitidas son: ${ coleccionesPermitidas }`
        });
    }
    
    switch (coleccion) {
        case 'usuarios':
            buscarUsuarios(termino, res);
            
            break;
        case 'categorias':
            buscarCategorias(termino, res);
            
            break;
        case 'productos':
            buscarProductos(termino, res);
            
            break;
    
        default:
            res.status(500).json({
                msg: 'Se le olvidó hacer esta búsqueda'
            })
    }
}

module.exports = {
    buscar
}