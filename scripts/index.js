var Wrapper = React.createClass({
	render: function(){
		return (
			<h1>This is heading</h1>
		)
	}
})

ReactDOM.render(
  <Wrapper/>,
  document.getElementById('content')
);
