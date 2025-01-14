import { makeStyles } from 'tss-react/mui';

export const useDatasetFilterStyles = makeStyles()((theme) => ({
  resourceComposition: {
    [theme.breakpoints.down('xl')]: {
      height: '21vh'
    },
    [theme.breakpoints.down('lg')]: {
      height: '20vh'
    },
    height: 'auto',
    marginBottom: theme.spacing(1.5),
    overflow: 'auto',
    paddingTop: theme.spacing(1),
    width: '100%'
  },
  resourceCompositionInner: {
    display: 'flex'
  },
  resourceCompositionItem: {
    display: 'grid',
    gridTemplateColumns: `${theme.spacing(25)} 1fr`
  },
  resourceType: {
    borderRadius: `${theme.shape.borderRadius}px 0px 0px ${theme.shape.borderRadius}px`
  },
  resources: {
    '& .MuiInputBase-root': {
      borderRadius: `0px ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0px`
    }
  }
}));
