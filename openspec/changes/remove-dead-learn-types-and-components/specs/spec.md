# Spec: remove-dead-learn-types-and-components

## Scenario: Dead Observatory types are gone

Given the change is merged
When the reviewer greps for the 12 Observatory interfaces
(`FtrData`, `ObservatoryData`, etc.) under `apps/learn/src`
Then zero definitions remain and no importer breaks.

## Scenario: Orphan components are gone

Given the change is merged
When the reviewer lists the 9 orphan component paths
Then none exists.

## Scenario: Learn build and suite stay green

Given the change is merged
When the learn production build and full test suite run
Then both pass, proving no dynamic reference was missed.
