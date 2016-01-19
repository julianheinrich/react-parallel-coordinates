'use strict';

var React = require ('react')
var ReactDOM = require ('react-dom')
var _ = require ('lodash')
var d3 = require ('d3')
var parcoords = require ('./parallel-coordinates/d3.parcoords.js')

require('./parallel-coordinates/d3.parcoords.css'); // TODO: find a css solution that refrains from using globals

class ParallelCoordinatesComponent extends React.Component {
	constructor (props) {
		super(props)
		this.state={ }
		this._bind('onBrushEnd','onBrush');
	}
	_bind(...methods) {
		methods.forEach( (method) => this[method] = this[method].bind(this) );
	}
	onBrushEnd (data) {
		data = _.map(data, function (d) { return ({ id: d.id, name: d.name }) })
		this.props.onBrushEnd_data(data)
		let ratio = 100/data.length
		this.pc.alpha( _.min([1,_.max([ratio,0.04])]) ).render()
		this.props.onBrushEnd_extents(this.pc.brushExtents())
		//console.log(ratio);
	}
	onBrush (data) {
		let ratio = 100/data.length
		this.pc.alpha( _.min([1,_.max([ratio,0.04])]) ).render()
		this.props.onBrush_extents(this.pc.brushExtents())
	}
	componentDidMount () { // component is now in the DOM

		var self = this
		let DOMNode = ReactDOM.findDOMNode(this)

		this.pc = d3.parcoords({
				//alpha: 0.2,
				color: "#069",
				shadowColor: "#f3f3f3", // does not exist in current PC version
				width: this.props.width,
				height: this.props.height,
				dimensionTitleRotation: this.props.dimensionTitleRotation || -50,
				margin: { top: 33, right: 0, bottom: 12, left: 0 },
				nullValueSeparator: "bottom"
			})( DOMNode )

		var ratio = 100/this.props.data.length;

		let types = _.zipObject(_.map(this.props.dimensions, (d)=>{return d.key}), _.map(this.props.dimensions, (d)=>{return d.type}))


		this.pc = this.pc
			.data(this.props.data)
			.alpha( _.min([1,_.max([ratio,0.04])]) )
			.composite("source-over") // globalCompositeOperation "darken" may be broken in chrome, "source-over" is boring
			.mode("queue")
			//
			// TODO: once dimensions-metadata is available in d3 par coords, this will be a single call
			.types(types)
			.dimensions(_.map(this.props.dimensions, (d)=>{return d.key}))
			// show/hide dimensions [0,1,2,3,4,5]
			.dimensionTitles(_.map(this.props.dimensions, (d)=>{return d.key}))
			.render()
			.shadows()
			////////////.commonScale(false, "number", [0,1])
			////////////.tickValues([0.00,0.25,0.50,0.75,1.00]) //[0,0.25,0.5,0.75,1.0]
			////////////.tickFormat('')
			.createAxes()
			.reorderable()
			.brushMode("1D-axes") // enable brushing
			.on("brushend", function (d) { self.onBrushEnd(d) })
			.on("brush", function (d) { self.onBrush(d) })
			//////////.on("resize", function (d) { console.log('onResize') })
			//////////.on("highlight", function (d) { console.log('onHighlight') })
			//////////.on("render", function (d) { console.log('onRender') })

		if (this.props.initialBrushExtents) {// set initial brushes
			this.pc.setBrushExtents(this.props.initialBrushExtents)
		}
		//this.pc.render()
	}/*
	componentDidUpdate: function () { // update w/ new data http://blog.siftscience.com/blog/2015/4/6/d-threeact-how-sift-science-made-d3-react-besties
		console.log('componentDidUpdate')
	},
	componentWillUnmount: function () { // clean up
		console.log('componentWillUnmount')
	},*/
	shouldComponentUpdate (nextProps, nextState) {
		return false
		//return (nextProps !== this.props)
	}
	render () {
		var style = {
			width: this.props.width,
			height: this.props.height,
			position: 'relative'
		};
		//return (<div className={'parcoords'} style={style}></div>)
		return React.createElement('div', { className: 'parcoords', style: style });
	}
}


module.exports = ParallelCoordinatesComponent;
