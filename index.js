var _ = require('lodash'),
    util = require('./util.js');

var request = require('request').defaults({
        baseUrl: 'https://api.bitbucket.org/2.0/'
    }),
    pickInputs = {
        'teamname': { key: 'teamname', validate: { req: true } }
    },
    pickOutputs = {
        '-': {
            key: 'values',
            fields: {
                'description': 'description',
                'created_on': 'created_on',
                'links_html': 'links.html.href',
                'name': 'name',
                'owner_teamname': 'owner.teamname',
                'owner_username': 'owner.username',
                'owner_links_self': 'owner.links.self.href'
            }
        }
    };

module.exports = {

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var credentials = dexter.provider('bitbucket').credentials(),
            inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs);

        // check params.
        if (validateErrors)
            return this.fail(validateErrors);

        var uriLink = 'teams/' + inputs.teamname + '/repositories';
        //send API request
        request.get({
            uri: uriLink,
            oauth: credentials,
            json: true
        }, function (error, response, body) {
            if (error || (body && body.error))
                this.fail(error || body.error);
            else if (typeof body === 'string')
                this.fail('Status code: ' + response.statusCode);
            else
                this.complete(util.pickOutputs(body, pickOutputs) || {});
        }.bind(this));
    }
};
