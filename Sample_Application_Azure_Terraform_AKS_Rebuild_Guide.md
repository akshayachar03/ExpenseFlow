# Sample Application — Docker + Terraform + Azure + ACR + AKS Rebuild Guide

## 1. Purpose

This document records the complete hands-on work used to containerize a full-stack sample application, provision Azure infrastructure with Terraform, push Docker images to Azure Container Registry (ACR), and deploy the application to Azure Kubernetes Service (AKS).

It is written as a rebuild guide for another KodeKloud Azure sandbox.

**Scope:** Docker, Terraform, Azure infrastructure, ACR, AKS, Kubernetes.

**Not used:** Azure DevOps/Azure Pipelines, Argo CD, SonarQube, Trivy, Ingress, HPA, service mesh, multi-region, DR, advanced monitoring.

---

## 2. Final Architecture

```text
Developer / Git
      |
      +----------------------+
      |                      |
Application Code          Terraform
      |                      |
      v                      v
Docker Images          Azure Infrastructure
      |                +-----+------+------+
      v                |     |      |      |
     ACR              VNet  NSG    ACR    AKS
                                          |
                                  expenseflow namespace
                                          |
                              +-----------+-----------+
                              |           |           |
                          Frontend     Backend     MongoDB
                           Nginx       Node.js      MongoDB
```

Application flow:

```text
Frontend -> Backend -> MongoDB
```

---

# 3. Technologies

- Docker
- Node.js / Express
- React / Vite
- MongoDB
- Terraform
- AzureRM provider
- Azure VNet
- Azure Subnet
- Azure NSG
- Azure Container Registry
- Azure Kubernetes Service
- Kubernetes Deployments
- Kubernetes Services
- ConfigMap
- Kubernetes Secret / imagePullSecret
- Azure Log Analytics
- Azure CLI
- kubectl
- Git/GitHub

---

# 4. Docker Containerization

The application has:

```text
frontend/
backend/
```

## 4.1 Frontend Dockerfile

`frontend/Dockerfile`

```dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

The Vite API URL is injected during the image build.

Example local value:

```text
VITE_API_BASE_URL=http://localhost:5001/api
```

## 4.2 Backend Dockerfile

`backend/Dockerfile`

```dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]
```

## 4.3 Docker ignore files

Frontend:

```text
node_modules
dist
.git
.gitignore
Dockerfile
README.md
```

Backend:

```text
node_modules
dist
.git
.gitignore
Dockerfile
.env
.env.*
README.md
```

Never copy `.env` or `node_modules` into the image.

## 4.4 Build images

From project root:

```bash
docker build -t expenseflow-frontend:1.1 ./frontend
docker build -t expenseflow-backend:1.1 ./backend
```

Verify:

```bash
docker images | grep expenseflow
```

---

# 5. Local Docker Networking

A Docker network was used:

```bash
docker network create expenseflow-network
```

The local architecture was:

```text
Browser
   |
Frontend container :8080
   |
Backend container :5001 -> :5000
   |
MongoDB container :27017
```

MongoDB used:

```text
mongo:7.0
```

Container name:

```text
expenseflow-mongodb
```

Docker MongoDB was used because the native MongoDB installation had host-kernel compatibility issues.

---

# 6. Git Preparation

Recommended `.gitignore`:

```gitignore
node_modules/
frontend/node_modules/
backend/node_modules/

.env
.env.*

dist/
build/

*.log

.vscode/
.idea/

.DS_Store
Thumbs.db
```

If Git history must be recreated:

```bash
rm -rf .git
git init
git branch -M main
git remote add origin <YOUR_REPOSITORY>
git add .
git commit -m "feat: complete application and Docker setup"
git push -u origin main
```

Do not commit:

```text
node_modules/
.env
terraform.tfstate
terraform.tfstate.backup
```

---

# 7. KodeKloud Azure Sandbox

The work was performed in a KodeKloud Azure sandbox because the personal Azure subscription was not usable for this exercise.

First:

```bash
az login
az account show
az account list --output table
```

Select the active subscription if needed:

```bash
az account set --subscription "<SUBSCRIPTION_ID>"
```

Find the Resource Group:

```bash
az group list --output table
```

## Important sandbox restrictions encountered

- Creating a new Resource Group was denied.
- Resource provider registration was denied.
- Some AKS VM sizes were denied.
- User node pools were restricted.
- Container Insights/OMS agent was not available.
- Azure role assignments were denied.
- Normal AKS -> ACR `AcrPull` role assignment could not be created.

Therefore the implementation was adapted to the sandbox.

---

# 8. Terraform Directory

```text
infra/
├── versions.tf
├── provider.tf
├── variables.tf
├── terraform.tfvars
├── resource-group.tf
├── networking.tf
├── acr.tf
├── monitoring.tf
├── aks.tf
└── outputs.tf
```

## 8.1 versions.tf

```hcl
terraform {
  required_version = ">= 1.15.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}
```

## 8.2 provider.tf

```hcl
provider "azurerm" {
  features {}

  resource_provider_registrations = "none"
}
```

`resource_provider_registrations = "none"` was required because the sandbox did not permit provider registration.

## 8.3 variables.tf

```hcl
variable "location" {
  description = "Azure region where resources will be deployed"
  type        = string
  default     = "eastus"
}

variable "resource_group_name" {
  description = "Existing KodeKloud Resource Group"
  type        = string
}

variable "vnet_name" {
  description = "Name of the virtual network"
  type        = string
}

variable "aks_subnet_name" {
  description = "Name of the AKS subnet"
  type        = string
}

variable "acr_name" {
  description = "Globally unique Azure Container Registry name"
  type        = string
}

variable "aks_name" {
  description = "Name of the AKS cluster"
  type        = string
}

variable "log_analytics_name" {
  description = "Name of the Log Analytics workspace"
  type        = string
}

variable "system_node_count" {
  description = "Number of nodes in the AKS system node pool"
  type        = number
}

variable "system_vm_size" {
  description = "VM size for the AKS system node pool"
  type        = string
}
```

## 8.4 terraform.tfvars

Use the Resource Group from the CURRENT lab:

```hcl
location            = "eastus"
resource_group_name = "kml_rg_main-<CURRENT_LAB_ID>"

vnet_name           = "expenseflow-vnet"
aks_subnet_name     = "aks-subnet"

acr_name            = "expenseflowacr2026"

aks_name            = "expenseflow-aks"
log_analytics_name  = "expenseflow-logs"

system_node_count   = 1
system_vm_size      = "Standard_D2s_v3"
```

The ACR name must be globally unique if changed.

---

# 9. Existing Resource Group

`resource-group.tf`

```hcl
data "azurerm_resource_group" "expenseflow" {
  name = var.resource_group_name
}
```

The sandbox already provides the Resource Group, so Terraform reads it rather than creating a new one.

---

# 10. Networking

`networking.tf`

```hcl
resource "azurerm_virtual_network" "expenseflow" {
  name                = var.vnet_name
  location            = data.azurerm_resource_group.expenseflow.location
  resource_group_name = data.azurerm_resource_group.expenseflow.name

  address_space = ["10.0.0.0/16"]

  tags = {
    project     = "ExpenseFlow"
    environment = "dev"
    managed_by  = "terraform"
  }
}

resource "azurerm_subnet" "aks" {
  name                 = var.aks_subnet_name
  resource_group_name  = data.azurerm_resource_group.expenseflow.name
  virtual_network_name = azurerm_virtual_network.expenseflow.name

  address_prefixes = ["10.0.1.0/24"]
}

resource "azurerm_network_security_group" "expenseflow" {
  name                = "expenseflow-nsg"
  location            = data.azurerm_resource_group.expenseflow.location
  resource_group_name = data.azurerm_resource_group.expenseflow.name

  tags = {
    project     = "ExpenseFlow"
    environment = "dev"
    managed_by  = "terraform"
  }
}

resource "azurerm_subnet_network_security_group_association" "aks" {
  subnet_id                 = azurerm_subnet.aks.id
  network_security_group_id = azurerm_network_security_group.expenseflow.id
}
```

Network layout:

```text
VNet 10.0.0.0/16
  |
  +-- AKS subnet 10.0.1.0/24
       |
       +-- NSG
```

---

# 11. ACR

`acr.tf`

```hcl
resource "azurerm_container_registry" "expenseflow" {
  name                = var.acr_name
  resource_group_name = data.azurerm_resource_group.expenseflow.name
  location            = data.azurerm_resource_group.expenseflow.location

  sku           = "Basic"
  admin_enabled = false

  tags = {
    project     = "ExpenseFlow"
    environment = "dev"
    managed_by  = "terraform"
  }
}
```

The registry stores:

```text
expenseflow-backend
expenseflow-frontend
```

---

# 12. Log Analytics

`monitoring.tf`

```hcl
resource "azurerm_log_analytics_workspace" "expenseflow" {
  name                = var.log_analytics_name
  location            = data.azurerm_resource_group.expenseflow.location
  resource_group_name = data.azurerm_resource_group.expenseflow.name

  sku               = "PerGB2018"
  retention_in_days = 30

  tags = {
    project     = "ExpenseFlow"
    environment = "dev"
    managed_by  = "terraform"
  }
}
```

Container Insights was not enabled because it was restricted by the sandbox.

---

# 13. AKS

`aks.tf`

```hcl
resource "azurerm_kubernetes_cluster" "expenseflow" {
  name                = var.aks_name
  location            = data.azurerm_resource_group.expenseflow.location
  resource_group_name = data.azurerm_resource_group.expenseflow.name

  dns_prefix = "expenseflow"

  default_node_pool {
    name           = "system"
    node_count     = var.system_node_count
    vm_size        = var.system_vm_size
    vnet_subnet_id = azurerm_subnet.aks.id

    temporary_name_for_rotation = "systemtmp"
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin    = "azure"
    load_balancer_sku = "standard"

    service_cidr   = "10.1.0.0/16"
    dns_service_ip = "10.1.0.10"
  }

  tags = {
    project     = "ExpenseFlow"
    environment = "dev"
    managed_by  = "terraform"
  }
}
```

Sandbox adaptation:

```text
1 system node
Standard_D2s_v3
No user node pool
No Container Insights
No role assignment
```

The conceptual production architecture can still have separate system and user pools.

---

# 14. Outputs

`outputs.tf`

```hcl
output "resource_group_name" {
  description = "ExpenseFlow resource group"
  value       = data.azurerm_resource_group.expenseflow.name
}

output "acr_login_server" {
  description = "ACR login server"
  value       = azurerm_container_registry.expenseflow.login_server
}

output "aks_name" {
  description = "AKS cluster name"
  value       = azurerm_kubernetes_cluster.expenseflow.name
}

output "log_analytics_workspace_id" {
  description = "Log Analytics workspace ID"
  value       = azurerm_log_analytics_workspace.expenseflow.id
}
```

---

# 15. Terraform Deployment

```bash
cd infra

terraform init
terraform fmt
terraform validate
terraform plan
terraform apply
```

Enter:

```text
yes
```

Then:

```bash
terraform output
```

Verify Azure resources:

```bash
az group list --output table
az aks list --output table
az acr list --output table
az monitor log-analytics workspace list --output table
```

---

# 16. Reusing Another KodeKloud Lab

This is important.

A new KodeKloud lab can have:

- different subscription
- different Resource Group
- different permissions
- different state

Never assume the old lab's Resource Group is available.

Check:

```bash
az account show
az group list --output table
```

Update:

```text
infra/terraform.tfvars
```

with the current Resource Group.

If the old Terraform state belongs to another lab and you intentionally want a fresh deployment:

```bash
mv terraform.tfstate terraform.tfstate.old
mv terraform.tfstate.backup terraform.tfstate.backup.old
```

Then:

```bash
terraform init
terraform plan
terraform apply
```

Do not delete state casually in a real environment.

---

# 17. Connect kubectl to AKS

```bash
az aks get-credentials   --resource-group "<CURRENT_RESOURCE_GROUP>"   --name expenseflow-aks   --overwrite-existing
```

Check:

```bash
kubectl get nodes
kubectl get pods -A
```

Expected node:

```text
aks-system-xxxxxxxx-vmss000000   Ready
```

---

# 18. Push Docker Images to ACR

Login:

```bash
az acr login --name expenseflowacr2026
```

Tag:

```bash
docker tag expenseflow-backend:1.1   expenseflowacr2026.azurecr.io/expenseflow-backend:1.0

docker tag expenseflow-frontend:1.1   expenseflowacr2026.azurecr.io/expenseflow-frontend:1.0
```

Push:

```bash
docker push expenseflowacr2026.azurecr.io/expenseflow-backend:1.0
docker push expenseflowacr2026.azurecr.io/expenseflow-frontend:1.0
```

Verify:

```bash
az acr repository list   --name expenseflowacr2026   --output table
```

---

# 19. ACR -> AKS Authentication

In production, use AKS managed identity + AcrPull.

The sandbox blocked role assignments, so the lab workaround was ACR admin authentication.

Enable it:

```bash
az acr update   --name expenseflowacr2026   --admin-enabled true
```

Create namespace:

```bash
kubectl create namespace expenseflow
```

Create image pull secret:

```bash
kubectl create secret docker-registry acr-secret   --namespace expenseflow   --docker-server=expenseflowacr2026.azurecr.io   --docker-username="$(az acr credential show --name expenseflowacr2026 --query username --output tsv)"   --docker-password="$(az acr credential show --name expenseflowacr2026 --query 'passwords[0].value' --output tsv)"
```

Verify:

```bash
kubectl get secret -n expenseflow
```

Never expose or commit the password.

---

# 20. Kubernetes Files

Final directory:

```text
k8s/
├── mongodb.yaml
├── configmap.yaml
├── backend.yaml
└── frontend.yaml
```

---

# 21. MongoDB

`k8s/mongodb.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb
  namespace: expenseflow
spec:
  replicas: 1

  selector:
    matchLabels:
      app: mongodb

  template:
    metadata:
      labels:
        app: mongodb

    spec:
      containers:
        - name: mongodb
          image: mongo:7.0

          ports:
            - containerPort: 27017

          env:
            - name: MONGO_INITDB_DATABASE
              value: expenseflow

          resources:
            requests:
              cpu: "100m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"

---
apiVersion: v1
kind: Service
metadata:
  name: mongodb
  namespace: expenseflow
spec:
  selector:
    app: mongodb

  ports:
    - port: 27017
      targetPort: 27017

  type: ClusterIP
```

Apply:

```bash
kubectl apply -f k8s/mongodb.yaml
```

Verify:

```bash
kubectl get pods -n expenseflow
kubectl get svc -n expenseflow
```

For this lab, MongoDB runs inside AKS. Production would normally use a managed database.

---

# 22. ConfigMap

`k8s/configmap.yaml`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: expenseflow-config
  namespace: expenseflow

data:
  MONGODB_URI: "mongodb://mongodb:27017/expenseflow"
  NODE_ENV: "production"
  PORT: "5000"
```

Apply:

```bash
kubectl apply -f k8s/configmap.yaml
```

Verify:

```bash
kubectl get configmap -n expenseflow
```

The backend connects to:

```text
mongodb:27017
```

`mongodb` is the Kubernetes Service name, not a Pod IP.

---

# 23. Backend

`k8s/backend.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: expenseflow
spec:
  replicas: 1

  selector:
    matchLabels:
      app: backend

  template:
    metadata:
      labels:
        app: backend

    spec:
      imagePullSecrets:
        - name: acr-secret

      containers:
        - name: backend
          image: expenseflowacr2026.azurecr.io/expenseflow-backend:1.0

          ports:
            - containerPort: 5000

          envFrom:
            - configMapRef:
                name: expenseflow-config

          env:
            - name: JWT_SECRET
              value: "expenseflow-kodekloud-secret"

          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"

            limits:
              cpu: "500m"
              memory: "512Mi"

---
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: expenseflow

spec:
  selector:
    app: backend

  ports:
    - port: 5000
      targetPort: 5000

  type: ClusterIP
```

Apply:

```bash
kubectl apply -f k8s/backend.yaml
```

Verify:

```bash
kubectl get pods -n expenseflow
kubectl get svc -n expenseflow
kubectl logs -n expenseflow deployment/backend
```

> The JWT secret above is only a sandbox example. In a real environment use a Kubernetes Secret/Key Vault rather than putting a secret value directly in a manifest.

---

# 24. Backend Test

```bash
kubectl port-forward -n expenseflow service/backend 5001:5000
```

In another terminal:

```bash
curl http://localhost:5001/api/health
```

Use the actual health route if the application uses a different path.

---

# 25. Frontend

`k8s/frontend.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: expenseflow

spec:
  replicas: 1

  selector:
    matchLabels:
      app: frontend

  template:
    metadata:
      labels:
        app: frontend

    spec:
      imagePullSecrets:
        - name: acr-secret

      containers:
        - name: frontend
          image: expenseflowacr2026.azurecr.io/expenseflow-frontend:1.0

          ports:
            - containerPort: 80

          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"

            limits:
              cpu: "300m"
              memory: "256Mi"

---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: expenseflow

spec:
  selector:
    app: frontend

  ports:
    - port: 80
      targetPort: 80

  type: NodePort
```

Apply:

```bash
kubectl apply -f k8s/frontend.yaml
```

Verify:

```bash
kubectl get pods -n expenseflow
kubectl get svc -n expenseflow
```

---

# 26. Access the Application

For the sandbox:

```bash
kubectl port-forward -n expenseflow service/frontend 8080:80
```

Open:

```text
http://localhost:8080
```

The backend can be made available locally with:

```bash
kubectl port-forward -n expenseflow service/backend 5001:5000
```

This matches the frontend's local API URL:

```text
http://localhost:5001/api
```

The port-forward is temporary and exists only for the terminal session.

---

# 27. Final Kubernetes Architecture

```text
AKS
|
+-- Namespace: expenseflow
    |
    +-- Frontend Deployment
    |      |
    |      +-- Frontend Pod (Nginx/React)
    |      |
    |      +-- Frontend Service (NodePort)
    |
    +-- Backend Deployment
    |      |
    |      +-- Backend Pod (Node.js)
    |      |
    |      +-- Backend Service (ClusterIP)
    |
    +-- MongoDB Deployment
    |      |
    |      +-- MongoDB Pod
    |      |
    |      +-- MongoDB Service (ClusterIP)
    |
    +-- ConfigMap
    |
    +-- acr-secret
```

---

# 28. Verification Checklist

```bash
kubectl get nodes
kubectl get all -n expenseflow
kubectl get configmap -n expenseflow
kubectl get secret -n expenseflow
kubectl get pods -n expenseflow -o wide
```

Check logs:

```bash
kubectl logs -n expenseflow deployment/frontend
kubectl logs -n expenseflow deployment/backend
kubectl logs -n expenseflow deployment/mongodb
```

Expected:

```text
frontend   1/1 Running
backend    1/1 Running
mongodb    1/1 Running
```

---

# 29. Troubleshooting

## ImagePullBackOff

```bash
kubectl describe pod <POD_NAME> -n expenseflow
```

Check:

```bash
kubectl get secret acr-secret -n expenseflow
```

Check ACR:

```bash
az acr repository list   --name expenseflowacr2026   --output table
```

Make sure image and tag exactly match the Deployment.

## Backend not running

```bash
kubectl get pods -n expenseflow
kubectl describe pod <BACKEND_POD> -n expenseflow
kubectl logs -n expenseflow deployment/backend
```

## MongoDB connection problem

Verify:

```bash
kubectl get svc mongodb -n expenseflow
```

The backend should use:

```text
mongodb://mongodb:27017/expenseflow
```

Do not use:

```text
localhost:27017
```

inside the backend Pod.

## Frontend "Failed to fetch"

Check backend:

```bash
kubectl get pods -n expenseflow
kubectl get svc -n expenseflow
```

Test:

```bash
kubectl port-forward -n expenseflow service/backend 5001:5000
curl http://localhost:5001/api/health
```

If backend works, verify the frontend was built with the expected API URL.

---

# 30. Final Repository Structure

```text
ExpenseFlow/
|
+-- backend/
|   +-- src/
|   +-- Dockerfile
|   +-- .dockerignore
|
+-- frontend/
|   +-- src/
|   +-- Dockerfile
|   +-- .dockerignore
|
+-- infra/
|   +-- versions.tf
|   +-- provider.tf
|   +-- variables.tf
|   +-- terraform.tfvars
|   +-- resource-group.tf
|   +-- networking.tf
|   +-- acr.tf
|   +-- monitoring.tf
|   +-- aks.tf
|   +-- outputs.tf
|
+-- k8s/
|   +-- mongodb.yaml
|   +-- configmap.yaml
|   +-- backend.yaml
|   +-- frontend.yaml
|
+-- .gitignore
+-- README.md
```

---

# 31. Rebuild From Scratch — Short Version

When a new KodeKloud lab starts:

### Step 1 — Azure

```bash
az login
az account show
az group list --output table
```

Get the current Resource Group.

### Step 2 — Terraform

Update `infra/terraform.tfvars`.

If intentionally starting fresh:

```bash
cd infra
mv terraform.tfstate terraform.tfstate.old
mv terraform.tfstate.backup terraform.tfstate.backup.old
```

Then:

```bash
terraform init
terraform fmt
terraform validate
terraform plan
terraform apply
```

### Step 3 — AKS

```bash
az aks get-credentials   --resource-group "<CURRENT_RESOURCE_GROUP>"   --name expenseflow-aks   --overwrite-existing

kubectl get nodes
```

### Step 4 — ACR

```bash
az acr login --name expenseflowacr2026

docker tag expenseflow-backend:1.1   expenseflowacr2026.azurecr.io/expenseflow-backend:1.0

docker tag expenseflow-frontend:1.1   expenseflowacr2026.azurecr.io/expenseflow-frontend:1.0

docker push expenseflowacr2026.azurecr.io/expenseflow-backend:1.0
docker push expenseflowacr2026.azurecr.io/expenseflow-frontend:1.0
```

### Step 5 — ACR Secret

```bash
az acr update   --name expenseflowacr2026   --admin-enabled true

kubectl create namespace expenseflow

kubectl create secret docker-registry acr-secret   --namespace expenseflow   --docker-server=expenseflowacr2026.azurecr.io   --docker-username="$(az acr credential show --name expenseflowacr2026 --query username --output tsv)"   --docker-password="$(az acr credential show --name expenseflowacr2026 --query 'passwords[0].value' --output tsv)"
```

### Step 6 — Kubernetes

```bash
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
```

### Step 7 — Verify

```bash
kubectl get all -n expenseflow
kubectl get pods -n expenseflow
kubectl get svc -n expenseflow
```

### Step 8 — Access

Backend:

```bash
kubectl port-forward -n expenseflow service/backend 5001:5000
```

Frontend:

```bash
kubectl port-forward -n expenseflow service/frontend 8080:80
```

Open:

```text
http://localhost:8080
```

---

# 32. What Was Actually Completed

- Docker containerization
- Frontend and backend Dockerfiles
- Multi-stage Docker builds
- Docker image creation and testing
- Docker networking
- Terraform and AzureRM provider configuration
- Terraform state handling
- Existing Resource Group integration
- Azure VNet
- Azure subnet
- NSG
- ACR
- Log Analytics
- AKS
- AKS networking
- AKS node pool configuration
- Azure CLI
- kubectl
- Kubernetes namespace
- Kubernetes Deployments
- Kubernetes Services
- Kubernetes ConfigMap
- Kubernetes imagePullSecret
- MongoDB deployment
- Backend deployment
- Frontend deployment
- ACR image pulling
- Frontend/backend/MongoDB connectivity testing
- KodeKloud sandbox troubleshooting

---

# 33. Manager / Interview Explanation

A concise explanation:

> I containerized a full-stack sample application using Docker and created separate images for the frontend and backend. I used Terraform with the AzureRM provider to provision Azure infrastructure including a VNet, subnet, NSG, ACR, AKS and Log Analytics workspace. I pushed the application images to ACR and deployed the frontend, backend and MongoDB workloads to AKS using Kubernetes Deployments and Services. I used ConfigMap for application configuration and an image pull secret for ACR authentication because of the restricted sandbox permissions. I then verified the application flow from frontend to backend and backend to MongoDB.

---

# 34. Sandbox vs Production

| Sandbox | Production-style |
|---|---|
| ACR admin credential/imagePullSecret | AKS managed identity + AcrPull |
| MongoDB inside AKS | Managed database |
| NodePort/port-forward | Ingress / Load Balancer / DNS |
| Plain JWT example | Kubernetes Secret / Azure Key Vault |
| One system node | Separate system/user pools |
| One MongoDB Pod | Highly available managed database |
| Manual kubectl deployment | CI/CD pipeline |
| Basic Log Analytics | Full Azure Monitor/Container Insights |
| One replica | Multiple replicas + autoscaling |

These production improvements were intentionally outside the two-day sandbox scope.

---

# 35. Final Project Status

```text
Docker                         DONE
Terraform                      DONE
Azure VNet                     DONE
Subnet                         DONE
NSG                            DONE
ACR                            DONE
Log Analytics                  DONE
AKS                            DONE
Kubernetes Namespace           DONE
MongoDB Deployment             DONE
Backend Deployment             DONE
Frontend Deployment            DONE
Kubernetes Services            DONE
ConfigMap                      DONE
ACR image pull configuration   DONE
Application on AKS             DONE

Azure DevOps                   NOT USED
Argo CD                        NOT USED
Ingress                        NOT USED
HPA                            NOT USED
SonarQube                      NOT USED
Trivy                          NOT USED
```

The resulting project is a reproducible baseline for learning Docker, Terraform, Azure infrastructure, ACR and AKS deployment in a restricted KodeKloud environment.
