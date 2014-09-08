(function (process) {
    this.global = this;

    process.bindings = {};

    process.binding = function binding(id) {
        switch(id) {
            case 'natives':
                return io.nodekit.
            case n:
                code block
                break;
            default:
                return '';
        }

    }

    function BindingModule(id) {
        this.filename = id + '.js';
        this.id = id;
        this.exports = {};
        this.loaded = false;
    }

    BindingModule.getSource = io.nodekit.natives.sources.getBinding;

    BindingModule.require = function(id) {
   
        process.moduleLoadList.push('BindingModule ' + id);

        var bindingModule = new BindingModule(id);

        bindingModule.compile();

        return bindingModule.exports;
    };

    BindingModule.getSource = function(id) {
        return NativeModule._source(id);
    }

    BindingModule.wrap = function(script) {
        return NativeModule.wrapper[0] + script + NativeModule.wrapper[1];
    };

    BindingModule.wrapper = [
      '(function (exports, require, module, __filename, __dirname) { ',
      '\n});'
    ];

    BindingModule.prototype.compile = function() {
        var source = BindingModule.getSource(this.id);
        source = NativeModule.wrap(source);

        var fn = runInThisContext(source, { filename: this.filename });
        fn(this.exports, NativeModule.require, this, this.filename);

        this.loaded = true;
    };

    BindingModule.prototype.cache = function() {
        NativeModule._cache[this.id] = this;
    };

});