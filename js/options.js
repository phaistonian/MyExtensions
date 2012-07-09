document.addEventListener('DOMContentLoaded', function() {
	Ext.initialize();

	$('button').addEventListener('click', function() {
		Ext.add($('hash').value);
	});

	document.querySelector('#form .foo').addEventListener('click', function() {
		Ext.find();
	});
});