/* Boot: render the first view, then connect storage. */
document.body.dataset.view=state.view;renderView();
store.init();
