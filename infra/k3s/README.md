# Findr k3s deployment

Create the runtime secret before applying this kustomization. Do not commit the
real values:

```bash
kubectl -n findr create secret generic findr-secrets \
  --from-literal=db-password='<database password>' \
  --from-literal=firebase-project-id='<Firebase project ID>'
```

The namespace must exist before creating the secret:

```bash
kubectl apply -f namespace.yaml
kubectl apply -k .
```
