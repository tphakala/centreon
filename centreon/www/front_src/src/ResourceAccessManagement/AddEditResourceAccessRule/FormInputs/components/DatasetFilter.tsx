/* eslint-disable react/no-array-index-key */
import { ReactElement } from 'react';

import { useTranslation } from 'react-i18next';

import { FormHelperText } from '@mui/material';
import FilterIcon from '@mui/icons-material/Tune';

import { MultiConnectedAutocompleteField, SelectField } from '@centreon/ui';
import { ItemComposition } from '@centreon/ui/components';

import { Dataset } from '../../../models';
import {
  labelDelete,
  labelAddFilter,
  labelSelectResource,
  labelSelectResourceType
} from '../../../translatedLabels';
import useDatasetFilter from '../hooks/useDatasetFilter';
import { useDatasetFilterStyles } from '../styles/DatasetFilter.styles';

type Props = {
  areResourcesFilled: (datasets: Array<Dataset>) => boolean;
  datasetFilter: Array<Dataset>;
  datasetFilterIndex: number;
};

const DatasetFilter = ({
  areResourcesFilled,
  datasetFilter,
  datasetFilterIndex
}: Props): ReactElement => {
  const { t } = useTranslation();
  const { classes } = useDatasetFilterStyles();

  const {
    addResource,
    changeResourceType,
    changeResources,
    deleteResource,
    deleteResourceItem,
    error,
    getResourceBaseEndpoint,
    getResourceTypeOptions,
    getSearchField,
    lowestResourceTypeReached
  } = useDatasetFilter(datasetFilter, datasetFilterIndex);

  const deleteButtonHidden = datasetFilter.length <= 1;

  return (
    <div className={classes.resourceComposition}>
      <ItemComposition
        IconAdd={<FilterIcon />}
        addbuttonDisabled={
          !areResourcesFilled(datasetFilter) || lowestResourceTypeReached()
        }
        labelAdd={t(labelAddFilter)}
        onAddItem={addResource}
      >
        {datasetFilter.map((resource, resourceIndex) => (
          <ItemComposition.Item
            className={classes.resourceCompositionItem}
            deleteButtonHidden={deleteButtonHidden}
            key={`${resourceIndex}${resource.resources[0]}`}
            labelDelete={t(labelDelete)}
            onDeleteItem={deleteResource(resourceIndex)}
          >
            <SelectField
              aria-label={`${labelSelectResourceType}`}
              className={classes.resourceType}
              label={t(labelSelectResourceType) as string}
              options={getResourceTypeOptions(resourceIndex)}
              selectedOptionId={resource.resourceType}
              onChange={changeResourceType(resourceIndex)}
            />
            <MultiConnectedAutocompleteField
              allowUniqOption
              chipProps={{
                color: 'primary',
                onDelete: (_, option): void =>
                  deleteResourceItem({
                    index: resourceIndex,
                    option,
                    resources: resource.resources
                  })
              }}
              className={classes.resources}
              dataTestId={labelSelectResource}
              disabled={!resource.resourceType}
              field={getSearchField(resource.resourceType)}
              getEndpoint={getResourceBaseEndpoint(resource.resourceType)}
              label={t(labelSelectResource) as string}
              limitTags={5}
              queryKey={`${resource.resourceType}-${resourceIndex}`}
              value={resource.resources || []}
              onChange={changeResources(resourceIndex)}
            />
          </ItemComposition.Item>
        ))}
      </ItemComposition>
      {error && <FormHelperText error>{t(error)}</FormHelperText>}
    </div>
  );
};

export default DatasetFilter;
