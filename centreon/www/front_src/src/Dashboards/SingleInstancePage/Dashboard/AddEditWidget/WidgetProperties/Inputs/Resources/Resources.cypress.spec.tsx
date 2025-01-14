import { Formik } from 'formik';
import { createStore, Provider } from 'jotai';

import { Method, TestQueryProvider } from '@centreon/ui';

import {
  singleHostPerMetricAtom,
  singleMetricSelectionAtom
} from '../../../atoms';
import { WidgetResourceType } from '../../../models';
import {
  labelAddFilter,
  labelResourceType,
  labelSelectAResource
} from '../../../../translatedLabels';
import { hasEditPermissionAtom, isEditingAtom } from '../../../../atoms';

import Resources from './Resources';
import { resourceTypeBaseEndpoints } from './useResources';

const generateResources = (resourceLabel: string): object => ({
  meta: {
    limit: 10,
    page: 1,
    total: 10
  },
  result: new Array(10).fill(null).map((_, index) => ({
    id: index,
    name: `${resourceLabel} ${index}`
  }))
});

interface InitializeProps {
  emptyData?: boolean;
  hasEditPermission?: boolean;
  isEditing?: boolean;
  restrictedResourceTypes?: Array<string>;
  singleHostPerMetric?: boolean;
  singleMetricSelection?: boolean;
  singleResourceType?: boolean;
}

const initialize = ({
  isEditing = true,
  hasEditPermission = true,
  singleResourceType = false,
  restrictedResourceTypes = [],
  singleHostPerMetric = false,
  singleMetricSelection = false,
  emptyData = false
}: InitializeProps): void => {
  const store = createStore();
  store.set(singleHostPerMetricAtom, singleHostPerMetric);
  store.set(singleMetricSelectionAtom, singleMetricSelection);
  store.set(isEditingAtom, isEditing);
  store.set(hasEditPermissionAtom, hasEditPermission);

  cy.interceptAPIRequest({
    alias: 'getHosts',
    method: Method.GET,
    path: `**${resourceTypeBaseEndpoints[WidgetResourceType.host]}**`,
    response: generateResources('Host')
  });

  cy.interceptAPIRequest({
    alias: 'getServices',
    method: Method.GET,
    path: `**${resourceTypeBaseEndpoints[WidgetResourceType.service]}**`,
    response: generateResources('Service')
  });

  cy.mount({
    Component: (
      <TestQueryProvider>
        <Provider store={store}>
          <Formik
            initialValues={{
              data: emptyData
                ? {}
                : {
                    resources: []
                  },
              moduleName: 'widget',
              options: {}
            }}
            onSubmit={cy.stub()}
          >
            <Resources
              label=""
              propertyName="resources"
              restrictedResourceTypes={restrictedResourceTypes}
              singleResourceType={singleResourceType}
              type=""
            />
          </Formik>
        </Provider>
      </TestQueryProvider>
    )
  });
};

describe('Resources', () => {
  it('displays host and service type when the corresponding atom is set to true', () => {
    initialize({ singleHostPerMetric: true, singleMetricSelection: true });

    cy.findAllByTestId(labelResourceType).eq(0).should('have.value', 'host');
    cy.findAllByTestId(labelResourceType).eq(1).should('have.value', 'service');

    cy.findAllByTestId(labelSelectAResource).eq(0).click();
    cy.waitForRequest('@getHosts');
    cy.contains('Host 0').click();

    cy.findAllByTestId(labelSelectAResource).eq(1).click();
    cy.waitForRequest('@getServices');
    cy.contains('Service 0').click();

    cy.findAllByTestId(labelSelectAResource)
      .eq(0)
      .should('have.value', 'Host 0');
    cy.findAllByTestId(labelSelectAResource)
      .eq(1)
      .should('have.value', 'Service 0');

    cy.makeSnapshot();
  });

  it('adds a new filter line when the first resource line is fullfilled add the button is clicked', () => {
    initialize({});

    cy.contains(labelAddFilter).should('be.disabled');

    cy.findByTestId(labelResourceType).parent().click();
    cy.contains(/^Host$/).click();
    cy.findByTestId(labelSelectAResource).click();
    cy.waitForRequest('@getHosts');
    cy.contains('Host 0').click();

    cy.contains(labelAddFilter).click();

    cy.findAllByTestId(labelResourceType).should('have.length', 2);

    cy.makeSnapshot();
  });

  it('does not display the Add filter button when the corresponding property is set to true', () => {
    initialize({ singleResourceType: true });

    cy.contains(labelAddFilter).should('not.exist');

    cy.makeSnapshot();
  });

  it('displays only the restricted resource types when the propety is defined', () => {
    initialize({
      restrictedResourceTypes: ['host-group', 'host', 'service-category']
    });

    cy.findByTestId(labelResourceType).parent().click();

    cy.contains(/^Host Group$/).should('be.visible');
    cy.contains(/^Host$/).should('be.visible');
    cy.contains(/^Service Category$/).should('be.visible');
    cy.contains(/^Service$/).should('not.exist');
    cy.contains(/^Host Category$/).should('not.exist');
    cy.contains(/^Service Group$/).should('not.exist');

    cy.makeSnapshot();
  });

  it('deletes a resource when the corresponding is clicked', () => {
    initialize({});

    cy.findByTestId(labelResourceType).parent().click();
    cy.contains(/^Host$/).click();
    cy.findByTestId(labelSelectAResource).click();
    cy.waitForRequest('@getHosts');
    cy.contains('Host 0').click();
    cy.findByTestId('CancelIcon').click();

    cy.contains('Host 0').should('not.exist');

    cy.makeSnapshot();
  });

  it('deletes a resource when the corresponding is clicked and corresponding prop are set', () => {
    initialize({ singleHostPerMetric: true, singleMetricSelection: true });

    cy.findAllByTestId(labelResourceType).eq(0).parent().click();
    cy.contains(/^Host$/).click();
    cy.findAllByTestId(labelSelectAResource).eq(0).click();
    cy.waitForRequest('@getHosts');
    cy.contains('Host 0').click();
    cy.findAllByTestId(labelSelectAResource).eq(0).focus();
    cy.findAllByTestId('CloseIcon').eq(0).click();

    cy.contains('Host 0').should('not.exist');

    cy.makeSnapshot();
  });

  it('selects a resource type and a resource when the data value does not exist', () => {
    initialize({ emptyData: true });

    cy.contains(labelAddFilter).click();
    cy.findByTestId(labelResourceType).parent().click();
    cy.contains(/^Host$/).click();
    cy.findByTestId(labelSelectAResource).click();
    cy.waitForRequest('@getHosts');
    cy.contains('Host 0').click();

    cy.findByTestId(labelResourceType).should('have.value', 'host');
    cy.contains('Host 0').should('be.visible');

    cy.findByTestId('CancelIcon').click();

    cy.contains('Host 0').should('not.exist');
  });
});

describe('Resources disabled', () => {
  it('displays fields as disabled when the edition mode is not activated', () => {
    initialize({ isEditing: false });

    cy.findByTestId(labelResourceType).should('be.disabled');
    cy.findByTestId(labelSelectAResource).should('be.disabled');

    cy.makeSnapshot();
  });

  it('displays fields as disabled when rights are not sufficient', () => {
    initialize({ hasEditPermission: false });

    cy.findByTestId(labelResourceType).should('be.disabled');
    cy.findByTestId(labelSelectAResource).should('be.disabled');

    cy.makeSnapshot();
  });
});
