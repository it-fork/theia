/********************************************************************************
 * Copyright (C) 2020 Ericsson and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { Container } from 'inversify';
import { VSXEnvironment } from './vsx-environment';
import { VSXRegistryAPI } from './vsx-registry-api';
import { EnvVariablesServer } from '@theia/core/lib/common/env-variables/env-variables-protocol';

import * as chai from 'chai';
import { VSXApiVersionProvider } from './vsx-api-version-provider';
import { VSXSearchParam } from './vsx-registry-types';
import URI from '@theia/core/lib/common/uri';
const expect = chai.expect;

describe('VSX Registry API', () => {

    let api: VSXRegistryAPI;

    beforeEach(() => {
        const container = new Container();
        container.bind(VSXRegistryAPI).toSelf().inSingletonScope();
        container.bind(VSXEnvironment).toConstantValue(<VSXEnvironment>{
            async getRegistryApiUri(): Promise<URI> {
                return new URI('https://open-vsx.org/api');
            },
            async getRegistryUri(): Promise<URI> {
                return new URI('https://open-vsx.org');
            },
            async getVscodeApiVersion(): Promise<string> {
                return '1.40.0';
            }
        });
        container.bind(EnvVariablesServer).toConstantValue({});
        container.bind(VSXApiVersionProvider).toConstantValue(<VSXApiVersionProvider>{
            getApiVersion(): string {
                return '1.40.0';
            }
        });
        api = container.get<VSXRegistryAPI>(VSXRegistryAPI);
    });

    describe('isEngineValid', () => {

        it('should return \'true\' for a compatible engine', () => {
            const a: boolean = api['isEngineValid']('^1.20.0');
            const b: boolean = api['isEngineValid']('^1.40.0');
            expect(a).to.eq(true);
            expect(b).to.eq(true);
        });

        it('should return \'false\' for a incompatible engine', () => {
            const valid: boolean = api['isEngineValid']('^1.50.0');
            expect(valid).to.eq(false);
        });

    });

    describe('buildQuery', () => {

        it('should build a proper query with the single `query` parameter present', async () => {
            const expected = 'https://open-vsx.org/api/-/search?query=javascript';
            const param: VSXSearchParam = {
                query: 'javascript',
            };
            const query = await api['buildQuery'](param);
            expect(query).to.eq(expected);
        });

        it('should build a proper query with the multiple parameters present', async () => {
            const expected = 'https://open-vsx.org/api/-/search?query=javascript&category=languages&size=20&offset=10&includeAllVersions=true';
            const param: VSXSearchParam = {
                query: 'javascript',
                category: 'languages',
                size: 20,
                offset: 10,
                includeAllVersions: true,
            };
            const query = await api['buildQuery'](param);
            expect(query).to.eq(expected);
        });

    });

});
