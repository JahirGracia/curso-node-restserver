const { request, response } = require("express");
const { Producto } = require('../models');


// obtenerProductos - Paginado - total - populate
const obtenerProductos = async( req = request, res = response) => {
    
    const { limite = 10, desde = 0 } = req.query;
    const query = { estado: true };

    const [ total, producto] = await Promise.all([
        Producto.countDocuments(query),
        Producto.find(query)
            .skip(Number(desde))
            .limit(Number(limite))
            // .populate('usuario')
            .populate('usuario', 'nombre')
            .populate('categoria', 'nombre')
    ]);

    res.json({
        total,
        producto
    })
}

// obtenerProducto  - populate {}
const obtenerProducto = async( req = request, res = response) => {

    const { id } = req.params;

    const producto = await Producto.findById(id)
                                .populate('usuario', 'nombre')
                                .populate('categoria', 'nombre');

    res.json(producto);
}


const crearProducto = async(req = request, res = response) => {

    const { estado, usuario, ...body } = req.body;

    const productoDB = await Producto.findOne({ nombre: body.nombre.toUpperCase() });

    if( productoDB ) {
        return res.status(400).json({
            msg: `El producto ${ productoDB.nombre } ya existe`
        });
    }

    // Generar la data a guardar
    const data = {
        ...body,
        nombre: body.nombre.toUpperCase(),
        usuario: req.usuario._id
    }

    const producto = new Producto( data );

    // Guardar DB
    await producto.save();

    res.status(201).json(producto);

}

// actualizarProducto
const actualizarProducto = async(req = request, res = response) => {
    
    const { id } = req.params;
    const {estado, usuario, ...data} = req.body;

    data.nombre = data.nombre.toUpperCase();
    data.usuario = req.usuario._id;

    const producto = await Producto.findByIdAndUpdate(id, data, { new: true }) //{ new: true } <<-- para que nos regrese el registro actualizado
                                .populate('usuario', 'nombre')
                                .populate('categoria', 'nombre');

    res.json(producto);
}

// borrarProducto - estado: false
const borrarProducto = async(req = request, res = response) => {
    
    const { id } = req.params;

    const producto = await Producto.findByIdAndUpdate(id, {estado: false}, { new: true })
                                .populate('usuario', 'nombre')
                                .populate('categoria', 'nombre');
    
    res.json({
        producto
    });
}

module.exports = {
    obtenerProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    borrarProducto
}