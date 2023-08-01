import {uid} from "../../shared";
import {action, define, observable} from "@formily/reactive";
import {IDesignerControllerProps, IDesignerProps} from "../types";
import _ from "lodash";
import {GlobalRegistry} from "../registry";

export interface ITreeNode {
    componentName?: string
    sourceName?: string
    // operation?: Operation
    hidden?: boolean
    isSourceNode?: boolean
    id?: string
    props?: Record<string | number | symbol, any>
    children?: ITreeNode[]
}

const TreeNodes = new Map<string, TreeNode>()

const resolveDesignerProps = (
    node: TreeNode,
    props: IDesignerControllerProps
) => {
    if (_.isFunction(props)) return props(node)
    return props
}

export class TreeNode {
    parent?: ITreeNode

    root?: ITreeNode

    // rootOperation: Operation

    id?: string

    depth = 0

    hidden = false

    componentName = 'NO_NAME_COMPONENT'

    sourceName = ''

    props: ITreeNode['props'] = {}

    children: TreeNode[] = []

    isSelfSourceNode?: boolean

    constructor(node?: ITreeNode, parent?: TreeNode) {
        if (node instanceof TreeNode) {
            return node
        }
        this.id = node?.id || uid()
        if (parent) {
            this.parent = parent
            this.depth = parent.depth + 1
            this.root = parent.root
            TreeNodes.set(this.id, this)
        } else {
            this.root = this
            // this.rootOperation = node.operation
            this.isSelfSourceNode = node?.isSourceNode || false
            TreeNodes.set(this.id, this)
        }
        if (node) {
            // this.from(node)
        }
        this.makeObservable()
    }

    makeObservable() {
        define(this, {
            componentName: observable.ref,
            props: observable,
            hidden: observable.ref,
            children: observable.shallow,
            designerProps: observable.computed,
            // designerLocales: observable.computed,
            // wrap: action,
            // prepend: action,
            // append: action,
            // insertAfter: action,
            // insertBefore: action,
            // remove: action,
            // setProps: action,
            // setChildren: action,
            // setComponentName: action
        })
    }

    get designerProps(): IDesignerProps {
        const behaviors = GlobalRegistry.getDesignerBehaviors(this)
        const designerProps: IDesignerProps = behaviors.reduce((buf, pattern) => {
            if (!pattern.designerProps) return buf
            Object.assign(buf, resolveDesignerProps(this, pattern.designerProps))
            return buf
        }, {})
        return designerProps
    }

    static findById(id: string) {
        return TreeNodes.get(id)
    }

}