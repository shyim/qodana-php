// Prints dependencies information
// https://next.yarnpkg.com/advanced/pnpapi#traversing-the-dependency-tree

if (!process.versions.pnp) {
  throw Error('process.versions.pnp not found: ' + JSON.stringify(process.versions, null, 2));
}

function createRequire(contextPath) {
  const module = require('module')
  if (typeof module.createRequire === 'function') {
    // https://next.yarnpkg.com/advanced/pnpapi/#requiremodule
    return module.createRequire(contextPath);
  }
  // noinspection JSDeprecatedSymbols
  if (typeof module.createRequireFromPath === 'function') {
    // Use createRequireFromPath (a deprecated version of createRequire) to support Node.js 10.x
    // noinspection JSDeprecatedSymbols
    return module.createRequireFromPath(contextPath);
  }
  throw Error('Cannot create require for context (' + contextPath + '). Expected node >= 12.2.0, actual node: ' + process.versions.node);
}

const pnpApi = (() => {
  const contextRequire = createRequire(process.cwd());
  const path = require('path');
  const pnpCjsParentDirPath = path.dirname(contextRequire.resolve('pnpapi'));
  if (path.resolve(pnpCjsParentDirPath) !== path.resolve(process.cwd())) {
    console.error('Expected pnpapi root: ' + process.cwd() + ', actual: ' + pnpCjsParentDirPath);
  }
  return contextRequire('pnpapi');
})();

const buildTree = (workspaceLocators) => {
  const tree = {};
  let nextDependencyId = 1;

  function traverse(packageLocator) {
    const packageLocatorJson = JSON.stringify(packageLocator);
    if (tree.hasOwnProperty(packageLocatorJson)) {
      return tree[packageLocatorJson];
    }
    const pkg = pnpApi.getPackageInformation(packageLocator);
    if (pkg == null) {
      console.error(pkg, 'Unavailable package information for ' + JSON.stringify(packageLocator));
      return null;
    }
    const dependency = createDependency(nextDependencyId++, packageLocator.name, pkg.packageLocation);
    tree[packageLocatorJson] = dependency;
    for (const [name, reference] of pkg.packageDependencies.entries()) {
      if (reference !== null) {
        const childDependency = traverse({name, reference});
        if (childDependency !== null && childDependency.id !== dependency.id) {
          dependency.dependencies.push(childDependency.id);
        }
      }
    }
    return dependency;
  }

  for (const workspaceLocator of workspaceLocators) {
    traverse(workspaceLocator);
  }

  return tree;
};

function createDependency(id, dependencyName, dependencyRequireableLocation) {
  const node = {
    id: id,
    name: dependencyName,
    requireableLocation: dependencyRequireableLocation,
    dependencies: []
  };
  if (typeof pnpApi.resolveVirtual === 'function') {
    const resolvedVirtual = pnpApi.resolveVirtual(dependencyRequireableLocation);
    if (resolvedVirtual && resolvedVirtual !== dependencyRequireableLocation) {
      node.resolvedVirtualRequireableLocation = resolvedVirtual;
    }
  }
  return node;
}

function addDependencyInfo(dependencies, dependencyName, dependencyRequireableLocation) {
  const info = {
    name: dependencyName,
    requireableLocation: dependencyRequireableLocation
  };
  if (typeof pnpApi.resolveVirtual === 'function') {
    const resolvedVirtual = pnpApi.resolveVirtual(dependencyRequireableLocation);
    if (resolvedVirtual && resolvedVirtual !== dependencyRequireableLocation) {
      info.resolvedVirtualRequireableLocation = resolvedVirtual;
    }
  }
  dependencies.push(info);
}

function fetchDependencyTree() {
  const dependencyTree = {};
  if (typeof pnpApi.getDependencyTreeRoots !== 'function') {
    throw Error('pnpapi.getDependencyTreeRoots is unavailable, pnp: ' + process.versions.pnp);
  }
  const tree = buildTree(pnpApi.getDependencyTreeRoots());
  dependencyTree.nodes = Object.values(tree);
  const workspaces = [];
  for (const workspaceLocator of pnpApi.getDependencyTreeRoots()) {
    const workspaceLocatorJson = JSON.stringify(workspaceLocator);
    const workspaceInfo = tree[workspaceLocatorJson];
    if (!workspaceInfo) {
      throw Error('Cannot find ' + workspaceLocatorJson);
    }
    workspaces.push({
                      location: workspaceInfo.requireableLocation,
                      id: workspaceInfo.id
                    });
  }
  dependencyTree.workspaces = workspaces;
  return dependencyTree;
}

const dependencyTree = fetchDependencyTree();
const result = {
  environment: {
    'process.versions': {
      node: process.versions.node,
      pnp: process.versions.pnp
    },
    'pnp.VERSIONS': pnpApi.VERSIONS,
    'pnp.resolveVirtual': typeof pnpApi.resolveVirtual === 'function'
  },
  dependencyTree: dependencyTree
};

process.stdout.write(
    "##intellij-yarn-pnp-deps-tree-start\n" +
    JSON.stringify(result) +
    "\n##intellij-yarn-pnp-deps-tree-end\n"
);
