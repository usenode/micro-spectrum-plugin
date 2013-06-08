
var spectrum = require('spectrum');

module.exports = function (Webapp) {

    Webapp.addPluginInit(function () {
        this.spectrumView = new spectrum.Renderer(this.webappRoot + '/views'); 
        this._addPublicTemplateHandlers();
    });

    Webapp.prototype._addPublicTemplateHandlers = function () {
        Webapp.get(/^((?:\/[\w_-]+)+)\/$/, function (request, response, next, path) {
            response.writeHead(301, {
                'Location' : path
            });
            response.end();
        });

        Webapp.get(/^(?:(\/)|((?:\/[\w_-]+)+))$/, function (request, response, next, index, path) {
            if (path && path === '/index') {
                response.writeHead(301, {
                    'Location' : '/'
                });
                return;
            }
            var templatePath = (index ? '/index' : path) + '.pub.spv',
                view         = this.view,
                webapp       = this;
            return this.spectrumView.loadTemplate(templatePath).then(function (template) {
                webapp.spectrumRenderTemplate(response, template);
            }, function (e) {
                if (e) {
                    // TODO spectrum.js should populate e.type
                    if (e.message && /could not load template/.test(e)) {
                        return null;
                    }
                    else {
                        throw e;
                    }
                }
                return null;
            });
        });
    };

    Webapp.prototype.spectrumRenderTemplate = function (response, template, args) {
        try {
            if (! args) {
                args = {};
            }
            if (this.spectrumAddSiteWideArgs) {
                this.spectrumAddSiteWideArgs(args);
            }
            var output = template.render(args);
            response.writeHead(200, {
                'Content-Type' : 'text/html; charset=utf-8',
                'Content-Length' : Buffer.byteLength(output)
            });
            response.write(output);
            response.end();
        }
        catch (e) {
            this.internalServerError(response, e);
        }
    };

    Webapp.prototype.spectrumRender = function (response, templatePath, args) {
        var webapp = this;
        this.spectrumView.loadTemplate(templatePath).then(function (template) {
            webapp.spectrumRenderTemplate(response, template, args);
        });
    };

};

