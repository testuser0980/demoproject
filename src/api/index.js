import { get, put } from './crud'

export { setBaseUrl } from './crud'

export const getOrgUnitTree = async () => {
    const me = await get('me?fields=organisationUnits')
    const rootIds = me.organisationUnits.map(ou => ou.id)

    const response = await get(
        'organisationUnits?paging=false&fields=id,displayName,path,children'
    )
    const allOrgUnits = response.organisationUnits.filter(ou =>
        rootIds.some(r => ou.path.includes(r))
    )

    const tree = allOrgUnits.filter(ou => rootIds.some(r => ou.id === r))

    tree.forEach(root => {
        const setChildren = parent => {
            parent.children = allOrgUnits.filter(ou =>
                parent.children.some(c => c.id === ou.id)
            )
            parent.children.forEach(c => setChildren(c))
        }
        setChildren(root)
    })

    return tree
}

export const getOrgUnit = async orgUnitId => {
    const response = await get(`organisationUnits/${orgUnitId}?paging=false`)

    if (response.status === 'ERROR') {
        console.error(response.message)
        return
    }

    return response
}

export const setOrgUnitCode = async orgUnit => {
    const response = await put(`organisationUnits/${orgUnit.id}`, orgUnit)
    return response.status === 'OK'
}
