/**
 * author: Nils Gehlenborg - nils@hms.harvard.edu
*/


Selection = function( items, filters ) {
    this.items = items || [];
    this.filters = filters || [];
    this.id = undefined;
};


Selection.prototype.createSelection = function( attributeId, filterId, parameters ) {
    var newItems = [];
    var filterInstance = filter.get(filterId);
    for ( var i = 0; i < this.items.length; ++i ) {
        if ( filterInstance.test( this.items[i], attributes[attributeId], parameters ) ) {
            newItems.push(this.items[i]);
        }
    }
    console.log( filter );
    return ( new Selection( newItems, this.filters.concat( [ { id: filterId, parameters: parameters, attributeId: attributeId, uuid: Utilities.generateUuid() } ] ) ) );
};


// should be a singleton
function SelectionList( palette ) {
    this.list = [];
    this.colors = {};
    this.palette = palette || d3.scale.category10().range();

    this.addSelection = function( selection ) {
        selection.id = this._nextId();
        this.list.push( selection );        

        this.colors[selection.id] = this._nextColor();

        $(EventManager).trigger( "item-selection-added", { selection: selection } );            

        return this;        
    };

    this.removeSelection = function( selection ) {
        for ( var i = 0; i < this.list.length; ++i ) {
            if ( this.list[i] === selection ) {
                console.log( 'Deleting selection ' + i + '.' );
                
                // remove selection from list
                this.list.splice(i,1);

                // return color to palette
                this.palette.push(this.colors[selection.id]);

                // remove selection from color map
                delete this.colors[selection.id];

                // clear selection id
                selection.id = undefined;

                $(EventManager).trigger( "item-selection-removed", { selection: selection, index: i } );            

                return;
            }
        }
        
        console.log( 'Unable to delete selection.' );
    };

    this.getSelectionIndex = function(selection){
        for ( var i = 0; i < this.list.length; ++i ) {
            if ( this.list[i] === selection ) {
                return i;
            }        
        }

        return undefined;
    }

    this.getSelection = function(index) {
        try {
            return ( this.list[index] );
        }
        catch ( error ) {
            // ignore
        }

        return undefined;
    };

    this.getColor = function( selection ) {
        try {
            return ( this.colors[selection.id] );
        }
        catch ( error ) {
            // ignore
        }

        return undefined;
    }

    this.getSize = function() {
        return this.list.length;
    }

    this._nextColor = function() {
        // use color pool and return black once pool is empty
        if ( this.palette.length > 0 ) {
            // first available color
            return this.palette.splice(0,1)[0];
        }

        return "#000";
    }

    this._nextId = function() {
        return Utilities.generateUuid();
    }
}
